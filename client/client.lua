local QBCore = exports["qb-core"]:GetCoreObject()
local PlayerData = QBCore.Functions.GetPlayerData()
local inChips = false
local currentShop, currentData
local pedSpawned = false
local listen = false
local ShopPed = {}
local NewZones = {}
local isShopOpen = false

-- NUI Callbacks
RegisterNUICallback('closeUI', function(_, cb)
    -- Reset UI state immediately
    isShopOpen = false
    currentShop = nil
    currentData = nil

    -- Reset focus and input immediately
    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)

    -- Clear any cached data in the UI
    SendNUIMessage({ action = 'closeShop' })

    if cb then cb('ok') end
end)

RegisterNUICallback('notifyError', function(data, cb)
    if data.message then
        QBCore.Functions.Notify(data.message, "error")
    end
    if cb then cb('ok') end
end)

RegisterNUICallback('buyItem', function(data, cb)
    if not data.item or not data.amount then 
        cb({ status = 'error', message = 'Invalid data' })
        return
    end
    TriggerServerEvent('qb-shops:server:buyItem', data.item, data.amount, currentShop)
    cb('ok')
end)

RegisterNUICallback('purchaseCart', function(data, cb)
    if not data.cartItems or not data.paymentMethod or not data.shop then
        QBCore.Functions.Notify("Invalid cart data", "error")
        cb({ status = 'error', message = 'Invalid cart data' })
        return
    end

    -- Trigger server purchase event and wait for server response
    TriggerServerEvent('qb-shops:server:purchaseCart', data.cartItems, data.shop, data.paymentMethod)

    if cb then cb({ status = 'success' }) end
end)

-- Add handler for purchase response
RegisterNetEvent('qb-shops:client:purchaseResponse', function(success, message)
    if success then
        QBCore.Functions.Notify(message or "Purchase successful!", "success")
        -- Close UI only after successful purchase; include shop key so NUI can clear cart for that shop
        isShopOpen = false
        SetNuiFocus(false, false)
        SetNuiFocusKeepInput(false)
        SendNUIMessage({ action = 'closeShop', success = true, shop = currentShop })

        -- Repeat focus release after a short delay in case focus was not released immediately
        CreateThread(function()
            Wait(100)
            SetNuiFocus(false, false)
            SetNuiFocusKeepInput(false)
            SendNUIMessage({ action = 'closeShop', success = true, shop = currentShop, force = true })
        end)
    else
        QBCore.Functions.Notify(message or "Purchase failed!", "error")
    end
end)

-- Utility command to force-close the shop UI and clear focus (call from F8 client console)
RegisterCommand('qbshops_forceclose', function()
    isShopOpen = false
    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)
    SendNUIMessage({ action = 'closeShop', force = true })
end, false)

-- Functions
local function createBlips()
    if pedSpawned then return end

    for store in pairs(Config.Locations) do
        if Config.Locations[store]["showblip"] then
            local StoreBlip = AddBlipForCoord(Config.Locations[store]["coords"]["x"], Config.Locations[store]["coords"]["y"], Config.Locations[store]["coords"]["z"])
            SetBlipSprite(StoreBlip, Config.Locations[store]["blipsprite"])
            SetBlipScale(StoreBlip, Config.Locations[store]["blipscale"])
            SetBlipDisplay(StoreBlip, 4)
            SetBlipColour(StoreBlip, Config.Locations[store]["blipcolor"])
            SetBlipAsShortRange(StoreBlip, true)
            BeginTextCommandSetBlipName("STRING")
            AddTextComponentSubstringPlayerName(Config.Locations[store]["label"])
            EndTextCommandSetBlipName(StoreBlip)
        end
    end
end

function OpenShopUI(shopKey, shopLabel, shopItems)
    if isShopOpen then return end

    if not shopKey or not shopLabel or not shopItems then return end
    -- Ensure proper cleanup first
    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)
    Wait(100) -- Small delay to ensure cleanup
    
    -- Set new UI state
    isShopOpen = true
    currentShop = shopKey
    currentData = shopItems
    SetNuiFocus(true, true)
    SetNuiFocusKeepInput(false)
    
    -- Ensure all items have required properties
    local validItems = {}
    for _, item in ipairs(shopItems) do
        if item.name and item.price and item.amount then
            local itemData = QBCore.Shared.Items[item.name]
            if itemData then
                item.label = itemData.label
                item.image = "nui://lj-inventory/html/images/" .. item.name .. ".png"
                item.description = itemData.description
                table.insert(validItems, item)
            end
        end
    end
    
    SendNUIMessage({
        action = 'openShop',
        shopData = {
            key = shopKey,
            label = shopLabel,
            items = validItems,
            slots = #validItems
        }
    })
end

local function openShop(shop, data)
    --Clean up if there's an existing shop open
    if isShopOpen then
        SetNuiFocus(false, false)
        SetNuiFocusKeepInput(false)
        isShopOpen = false
        currentShop = nil
        currentData = nil
        SendNUIMessage({
            action = 'closeShop'
        })
        Wait(500) -- Give the UI time to close properly
    end

    QBCore.Functions.TriggerCallback('qb-shops:server:SetShopInv', function(shopInvJson)
        local function SetupItems(checkLicense)
            local products =  Config.Locations[shop].products
            local items = {}
            local curJob
            local curGang
            shopInvJson = json.decode(shopInvJson)
            if Config.UseTruckerJob and next(shopInvJson) and shopInvJson[shop] then
                if next(shopInvJson) then
                    for k, v in pairs(shopInvJson[shop].products) do
                        products[k].amount = v.amount
                    end
                else print('No shop inventory found -- defaults enabled') end
            end
            for i = 1, #products do
            curJob = products[i].requiredJob
            curGang = products[i].requiredGang
            if curJob then goto jobCheck end
            if curGang then goto gangCheck end
            if checkLicense then goto licenseCheck end
            items[#items + 1] = products[i]
            goto nextIteration
            :: jobCheck ::
            for i2 = 1, #curJob do
                if PlayerData.job.name == curJob[i2] then
                    items[#items + 1] = products[i]
                end
            end
            goto nextIteration
            :: gangCheck ::
            for i2 = 1, #curGang do
                if PlayerData.gang.name == curGang[i2] then
                    items[#items + 1] = products[i]
                end
            end
            goto nextIteration
            :: licenseCheck ::
            if not products[i].requiresLicense then
                items[#items + 1] = products[i]
            end
            :: nextIteration ::
            end
            return items
        end
        TriggerServerEvent('qb-shops:server:SetShopList')
        local ShopItems = {}
        ShopItems.items = {}
        ShopItems.label = data["label"]
        if data.type == "weapon" and Config.FirearmsLicenseCheck then
            if PlayerData.metadata["licences"] and PlayerData.metadata["licences"].weapon and QBCore.Functions.HasItem("weaponlicense") then
                ShopItems.items = SetupItems()
                QBCore.Functions.Notify(Lang:t("success.dealer_verify"), "success")
                Wait(500)
            else
                ShopItems.items = SetupItems(true)
                QBCore.Functions.Notify(Lang:t("error.dealer_decline"), "error")
                Wait(500)
                QBCore.Functions.Notify(Lang:t("error.talk_cop"), "error")
                Wait(1000)
            end
        else
            ShopItems.items = SetupItems()
        end

        -- Ensure items are properly structured
        for k in pairs(ShopItems.items) do
            ShopItems.items[k].slot = k
        end

        -- No debug needed in production

        --[[ TriggerServerEvent("inventory:server:OpenInventory", "shop", "Itemshop_" .. shop, ShopItems) -- ]]
        -- Pass internal shop key so the NUI can reference the correct shop on purchase
        OpenShopUI(shop, ShopItems.label, ShopItems.items)
    end)
end

local function createPeds()
    if pedSpawned then return end

    for k, v in pairs(Config.Locations) do
        local current = type(v["ped"]) == "number" and v["ped"] or joaat(v["ped"])

        RequestModel(current)
        while not HasModelLoaded(current) do
            Wait(0)
        end

        ShopPed[k] = CreatePed(0, current, v["coords"].x, v["coords"].y, v["coords"].z-1, v["coords"].w, false, false)
        TaskStartScenarioInPlace(ShopPed[k], v["scenario"], 0, true)
        FreezeEntityPosition(ShopPed[k], true)
        SetEntityInvincible(ShopPed[k], true)
        SetBlockingOfNonTemporaryEvents(ShopPed[k], true)

        if Config.UseTarget then
            exports['qb-target']:AddTargetEntity(ShopPed[k], {
                options = {
                    {
                        label = v["targetLabel"],
                        icon = v["targetIcon"],
                        item = v["item"],
                        action = function()
                            openShop(k, Config.Locations[k])
                        end,
                        job = v.requiredJob,
                        gang = v.requiredGang
                    }
                },
                distance = 2.0
            })
        end
    end
    RequestModel(current)
    while not HasModelLoaded(current) do
        Wait(0)
    end
    pedSpawned = true
end

local function deletePeds()
    if not pedSpawned then return end

    for _, v in pairs(ShopPed) do
        DeletePed(v)
    end
    pedSpawned = false
end

-- Events
RegisterNetEvent("qb-shops:client:UpdateShop", function(shop, itemData, amount)
    TriggerServerEvent("qb-shops:server:UpdateShopItems", shop, itemData, amount)
end)

RegisterNetEvent("qb-shops:client:SetShopItems", function(shop, shopProducts)
    Config.Locations[shop]["products"] = shopProducts
end)

RegisterNetEvent("qb-shops:client:RestockShopItems", function(shop, amount)
    if not Config.Locations[shop].products then return end
    for k in pairs(Config.Locations[shop].products) do
        Config.Locations[shop].products[k].amount = Config.Locations[shop]["products"][k].amount + amount
    end
end)

RegisterNetEvent('QBCore:Client:OnPlayerLoaded', function()
    PlayerData = QBCore.Functions.GetPlayerData()
    createBlips()
    createPeds()
    TriggerServerEvent('qb-shops:server:SetShopList')
end)

RegisterNetEvent('QBCore:Client:OnPlayerUnload', function()
    deletePeds()
    PlayerData = nil
end)

RegisterNetEvent('QBCore:Player:SetPlayerData', function(val)
    PlayerData = val
end)

AddEventHandler('onResourceStart', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    createBlips()
    createPeds()
    TriggerServerEvent('qb-shops:server:SetShopList')
end)

AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end

    -- Clear UI and focus when resource stops
    if isShopOpen then
        isShopOpen = false
        SetNuiFocus(false, false)
        SetNuiFocusKeepInput(false)
        currentShop = nil
        currentData = nil
    end
    
    deletePeds()
end)