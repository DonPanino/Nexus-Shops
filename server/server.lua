local QBCore = exports['qb-core']:GetCoreObject()
local lastPurchases = {}
local PURCHASE_COOLDOWN = 2000 -- 2 seconds cooldown between purchases

--Events
QBCore.Functions.CreateCallback('qb-shops:server:SetShopInv', function(_,cb)
    local shopInvJson = LoadResourceFile(GetCurrentResourceName(), Config.ShopsInvJsonFile)
    
    -- Validate JSON data
    if not shopInvJson then
        print('Warning: No shop inventory file found at:', Config.ShopsInvJsonFile)
        cb('{}')
        return
    end

    local success, decoded = pcall(json.decode, shopInvJson)
    if not success then
        print('Error: Invalid JSON in shop inventory file')
        cb('{}')
        return
    end

    cb(shopInvJson)
end)
RegisterNetEvent('qb-shops:server:SaveShopInv',function()
    if not Config.UseTruckerJob then return end
    local shopinv = {}
    for k, v in pairs(Config.Locations) do
        shopinv[k] = {}
        shopinv[k].products = {}
        for kk, vv in pairs(v.products) do
            shopinv[k].products[kk] = {}
            shopinv[k].products[kk].amount = vv['amount']
        end
    end
    SaveResourceFile(GetCurrentResourceName(), Config.ShopsInvJsonFile, json.encode(shopinv))
end)
RegisterNetEvent('qb-shops:server:UpdateShopItems', function(shop, itemData, amount)
    if not Config.UseTruckerJob then return end
    if not shop or not itemData or not amount then return end
    Config.Locations[shop].products[itemData.slot].amount -= amount
    if Config.Locations[shop].products[itemData.slot].amount < 0 then
        Config.Locations[shop].products[itemData.slot].amount = 0
    end
    TriggerEvent('qb-shops:server:SaveShopInv')
    TriggerClientEvent('qb-shops:client:SetShopItems', -1, shop, Config.Locations[shop].products)
end)
RegisterNetEvent('qb-shops:server:RestockShopItems', function(shop)
    if not shop or not Config.Locations[shop].products then return end
    local randAmount = math.random(10, 50)
    for k in pairs(Config.Locations[shop].products) do
        Config.Locations[shop].products[k].amount += randAmount
    end
    TriggerEvent('qb-shops:server:SaveShopInv')
    TriggerClientEvent('qb-shops:client:RestockShopItems', -1, shop, randAmount)
end)
local ItemList = {
    ["casinochips"] = 1,
}
RegisterNetEvent('qb-shops:server:sellChips', function()
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    local xItem = Player.Functions.GetItemByName("casinochips")
    if xItem then
        for k in pairs(Player.PlayerData.items) do
            if Player.PlayerData.items[k] then
                if ItemList[Player.PlayerData.items[k].name] then
                    local price = ItemList[Player.PlayerData.items[k].name] * Player.PlayerData.items[k].amount
                    Player.Functions.RemoveItem(Player.PlayerData.items[k].name, Player.PlayerData.items[k].amount, k)
                    Player.Functions.AddMoney("cash", price, "sold-casino-chips")
                    QBCore.Functions.Notify(src, "You sold your chips for $" .. price)
                    TriggerEvent("qb-log:server:CreateLog", "casino", "Chips", "blue", "**" .. GetPlayerName(src) .. "** got $" .. price .. " for selling the Chips")
                end
            end
        end
    else
        QBCore.Functions.Notify(src, "You have no chips..")
    end
end)
RegisterNetEvent('qb-shops:server:SetShopList',function()
    local shoplist = {}
    local cnt = 0
    for k, v in pairs(Config.Locations) do
        cnt = cnt + 1
        shoplist[cnt] = {}
        shoplist[cnt].name = k
        shoplist[cnt].coords = v.delivery
    end
    TriggerClientEvent('qb-truckerjob:client:SetShopList',-1,shoplist)
end)

RegisterNetEvent('qb-shops:server:purchaseCart', function(cartItems, shop, paymentMethod)
    local src = source
    -- purchaseCart called
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then
        print('Error: Player not found for source', src)
        TriggerClientEvent('qb-shops:client:purchaseResponse', src, false, 'Player not found')
        return
    end
    -- Rate limit check
    local currentTime = GetGameTimer()
    local lastPurchase = lastPurchases[src]
    if lastPurchase and (currentTime - lastPurchase) < PURCHASE_COOLDOWN then
        TriggerClientEvent('qb-shops:client:purchaseResponse', src, false, 'Please wait before making another purchase')
        return
    end
    lastPurchases[src] = currentTime

    -- Validate shop exists
    if not Config.Locations[shop] then
        print('Error: Invalid shop:', tostring(shop))
        TriggerClientEvent('qb-shops:client:purchaseResponse', src, false, 'Invalid shop')
        return
    end

    -- Validate payment method
    if paymentMethod ~= 'cash' and paymentMethod ~= 'bank' then
        print('Error: Invalid payment method:', tostring(paymentMethod))
        TriggerClientEvent('qb-shops:client:purchaseResponse', src, false, 'Invalid payment method')
        return
    end

    -- Calculate total price and validate items
    local totalPrice = 0
    local shopProducts = Config.Locations[shop].products
    local itemsToGive = {}

    for _, cartItem in pairs(cartItems) do
        local itemName = cartItem.name
        local amount = tonumber(cartItem.amount)
        if not amount or amount < 1 then
            print('Error: Invalid amount for', tostring(itemName))
            TriggerClientEvent('qb-shops:client:purchaseResponse', src, false, 'Invalid amount for ' .. tostring(itemName))
            return
        end

        local itemData = nil
        for _, product in pairs(shopProducts) do
            if product.name == itemName then
                itemData = product
                break
            end
        end

        if not itemData then
            print('Error: Item not found in shop:', tostring(itemName))
            TriggerClientEvent('qb-shops:client:purchaseResponse', src, false, itemName .. ' not found in shop')
            return
        end

        if Config.UseTruckerJob and itemData.amount ~= -1 and itemData.amount < amount then
            print('Error: Not enough stock for', tostring(itemName))
            TriggerClientEvent('qb-shops:client:purchaseResponse', src, false, 'Not enough stock of ' .. QBCore.Shared.Items[itemName].label)
            return
        end

        totalPrice = totalPrice + (itemData.price * amount)
        table.insert(itemsToGive, { name = itemName, amount = amount, itemData = itemData })
    end

    local playerMoney = Player.PlayerData.money[paymentMethod]
    if playerMoney < totalPrice then
        print('Info: Player does not have enough money')
        TriggerClientEvent('qb-shops:client:purchaseResponse', src, false, 'Not enough ' .. paymentMethod)
        return
    end

    -- Process transaction
    if Player.Functions.RemoveMoney(paymentMethod, totalPrice, 'shop-purchase') then
        -- Removed money from player
        local success = true
        local givenItems = {}

        for _, item in ipairs(itemsToGive) do
            -- Giving item to player
            if Player.Functions.AddItem(item.name, item.amount) then
                table.insert(givenItems, { name = item.name, amount = item.amount })
                if Config.UseTruckerJob and item.itemData.amount ~= -1 then
                    TriggerEvent('qb-shops:server:UpdateShopItems', shop, item.itemData, item.amount)
                end
            else
                print('Error: Failed to add item to player inventory:', item.name)
                success = false
                break
            end
        end

        if success then
            local itemList = ''
            for i, it in ipairs(givenItems) do
                itemList = itemList .. it.amount .. 'x ' .. QBCore.Shared.Items[it.name].label
                if i < #givenItems then itemList = itemList .. ', ' end
            end
            TriggerClientEvent('qb-shops:client:purchaseResponse', src, true, 'Purchased: ' .. itemList)
        else
            print('Error: Rolling back transaction for', src)
            Player.Functions.AddMoney(paymentMethod, totalPrice, 'shop-refund')
            for _, it in ipairs(givenItems) do
                Player.Functions.RemoveItem(it.name, it.amount)
            end
            TriggerClientEvent('qb-shops:client:purchaseResponse', src, false, 'Your inventory is full!')
        end
    else
        print('Error: Failed to remove money for player', src)
        TriggerClientEvent('qb-shops:client:purchaseResponse', src, false, 'Transaction failed!')
    end
end)
