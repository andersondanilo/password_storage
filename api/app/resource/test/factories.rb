FactoryGirl.define do
  factory :category, class: PasswordStorage::Resource::Infrastruture::CategoryDocument do
    uuid { "fake-#{SecureRandom.uuid}" }
    name "Category 1"
  end

  factory :password, class: PasswordStorage::Resource::Infrastruture::PasswordDocument do
    uuid { "fake-#{SecureRandom.uuid}" }
  end
end