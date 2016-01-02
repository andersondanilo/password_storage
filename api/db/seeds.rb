Client = PasswordStorage::Authentication::Infrastruture::ClientDocument

Client.find_or_create_by({
  client_id: 'passwordstorage_app',
  client_secret: '7aa5b2b850e267e9ff9689d5cf5491efc530627b'
})