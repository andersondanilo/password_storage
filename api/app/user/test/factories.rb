FactoryGirl.define do
  factory :user, class: PasswordStorage::User::Infrastruture::UserDocument do
    name "Test user"
    email "test@test.com"
    password "testtest"
  end 
end