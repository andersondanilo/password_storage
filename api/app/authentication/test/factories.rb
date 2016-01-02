FactoryGirl.define do
  factory :client, class: PasswordStorage::Authentication::Infrastruture::ClientDocument do
    client_id "test-id"
    client_secret "test-secret"
  end

  factory :access_token, class: PasswordStorage::Authentication::Infrastruture::AccessTokenDocument do
    token { SecureRandom.base64(32) }
    expires_in { 15.minutes }
    expires_at { 15.minutes.since }
  end
end