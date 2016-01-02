require 'bcrypt'

module PasswordStorage
  module User
    module Domain
      class User
        include BCrypt

        attr_accessor :id,
                      :name,
                      :email,
                      :password,
                      :password_hash,
                      :crypt_salt

        def verify_password(other_password)
          Password.new(@password_hash) == other_password
        end

      end
    end
  end
end