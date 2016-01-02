module PasswordStorage
  module User
    module Infrastruture
      class UserDocument
        include Mongoid::Document
        include Core::Infrastruture::RevisableConcern
        include BCrypt

        store_in collection: "users"

        field :name, type: String
        field :password_hash, type: String
        field :email, type: String
        field :crypt_salt, type: String

        index({email: 1}, {unique: true, background: true})

        def password
          @password
        end

        def password=(new_password)
          @password = new_password
          self.password_hash = Password.create(@password)
        end
      end
    end
  end
end