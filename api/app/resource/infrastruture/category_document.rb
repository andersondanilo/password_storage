require 'singleton'

module PasswordStorage
  module Resource::Infrastruture
    class CategoryDocument
      include Mongoid::Document
      include Core::Infrastruture::RevisableConcern
      
      field :uuid, type: String
      field :name, type: String
      field :active, type: Boolean, default: true

      belongs_to :user, class_name: User::Infrastruture::UserDocument.name

      index({user_id: 1}, {background: true})
      index({uuid: 1}, {background: true})

      store_in collection: "categories"      
    end
  end
end