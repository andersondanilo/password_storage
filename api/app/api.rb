require 'grape'
require 'grape-entity'
require 'active_support/concern'
require 'mongoid'
require 'grape-swagger'

require_relative 'helpers'

module PasswordStorage

  # Load modules
  @@base_path = File.dirname(__FILE__)

  autoload_relative File.dirname(__FILE__), 'core/core'
  autoload_relative File.dirname(__FILE__), 'user/user'
  autoload_relative File.dirname(__FILE__), 'authentication/authentication'
  autoload_relative File.dirname(__FILE__), 'resource/resource'

  # Load config
  @@config_path = "#{@@base_path}/../config"

  def self.config_path
    @@config_path
  end
  def self.base_path
    @@base_path
  end

  def self.modules
    [
      PasswordStorage::Core,
      PasswordStorage::Resource,
      PasswordStorage::User,
      PasswordStorage::Authentication,
    ]
  end

  # Load API Base
  class API < Grape::API
    prefix :api
    format :json
    version 'v1', using: :path, vendor: 'PasswordStorage', cascade: false

    error_formatter :json, Core::Presenter::JsonApi::ErrorPresenter

    helpers do
      def require_access_token
        access_token = request.env[Rack::OAuth2::Server::Resource::ACCESS_TOKEN]

        unless authentication_service.verify_access_token(access_token)
          fail Rack::OAuth2::Server::Resource::Bearer::Unauthorized
        end

        access_token
      end
    end

    mount User::UserApi
    mount Authentication::AuthenticationApi
    mount Resource::CategoriesApi
    mount Resource::PasswordsApi

    add_swagger_documentation \
      api_version: 'v1',
      hide_format: true,
      hide_documentation_path: true

  end
end