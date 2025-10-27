fx_version 'cerulean'
game 'gta5'

description 'Nexus Shops for QBCore'
version '0.1'

shared_scripts {
    '@PolyZone/client.lua',
    '@PolyZone/BoxZone.lua',
    '@PolyZone/EntityZone.lua',
    '@PolyZone/CircleZone.lua',
    '@PolyZone/ComboZone.lua',
    '@qb-core/shared/locale.lua',
    'locale/en.lua',
    'locale/*.lua',
    'config.lua'
}

client_script 'client/main.lua'
server_script 'server/main.lua'

ui_page 'dist/index.html'
files {
    'dist/index.html',
    'json/shops-inventory.json',
    'dist/**/*'
}

lua54 'yes'