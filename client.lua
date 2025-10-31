-- FiveM Shop UI Client Script
-- Place this in your qb-core shop resource

local isShopOpen = false

function OpenShopUI(shopLabel, shopItems)
    if isShopOpen then return end

    isShopOpen = true
    SetNuiFocus(true, true)

    SendNUIMessage({
        action = 'openShop',
        shopData = {
            label = shopLabel,
            items = shopItems,
            slots = #shopItems
        }
    })
end

-- NUI Callbacks
RegisterNUICallback('closeUI', function(data, cb)
    isShopOpen = false
    SetNuiFocus(false, false)
    cb('ok')
end)

RegisterNUICallback('purchaseItem', function(data, cb)
    local item = data.item
    local quantity = data.quantity

    -- Trigger your qb-core shop purchase event here
    TriggerServerEvent('qb-shops:server:purchaseItem', item, quantity)

    cb('ok')
end)

-- Example: How to use this in your existing shop script
-- Replace your existing shop opening code with this:
--[[
RegisterNetEvent('qb-shops:client:openShop', function(shop, ShopItems)
    OpenShopUI("Shop Name", ShopItems)
end)
]]

-- Example usage with your existing code:
-- Just replace the TriggerServerEvent line with:
-- OpenShopUI("Item Shop", ShopItems)

-- ESC key handler is built into the React UI
