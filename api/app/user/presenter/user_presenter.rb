require 'bcrypt'
require 'digest'

module PasswordStorage
  module User
    module Presenter
      class UserPresenter < Grape::Entity

        def self.type_name
          'users'
        end

        def self.url(user, env)
          "/users/current"
        end

        expose :salt do |user, options|
          Digest::MD5.hexdigest "#{user.crypt_salt}#{PasswordStorage.config.crypt_salt}"
        end

        expose :name
        expose :email

      end
    end
  end
end