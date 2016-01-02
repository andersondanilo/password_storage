module PasswordStorage
  module Authentication
    extend Core::ModuleBase

    module Domain
      autoload_relative File.dirname(__FILE__), 'domain/access_token'
      autoload_relative File.dirname(__FILE__), 'domain/authorization_code'
      autoload_relative File.dirname(__FILE__), 'domain/client'
      autoload_relative File.dirname(__FILE__), 'domain/refresh_token'
    end

    module Infrastruture
      autoload_relative File.dirname(__FILE__), 'infrastruture/access_token_document'
      autoload_relative File.dirname(__FILE__), 'infrastruture/refresh_token_document'
      autoload_relative File.dirname(__FILE__), 'infrastruture/authorization_code_document'
      autoload_relative File.dirname(__FILE__), 'infrastruture/client_document'
      autoload_relative File.dirname(__FILE__), 'infrastruture/access_token_repository'
      autoload_relative File.dirname(__FILE__), 'infrastruture/refresh_token_repository'
      autoload_relative File.dirname(__FILE__), 'infrastruture/authorization_code_repository'
      autoload_relative File.dirname(__FILE__), 'infrastruture/client_repository'
      autoload_relative File.dirname(__FILE__), 'infrastruture/oauth_service'
    end

    autoload_relative File.dirname(__FILE__), 'authentication_api'
    autoload_relative File.dirname(__FILE__), 'authentication_service'

    register(:access_token_repository) { Infrastruture::AccessTokenRepository.instance }
    register(:refresh_token_repository) { Infrastruture::RefreshTokenRepository.instance }
    register(:authorization_code_repository) { Infrastruture::AuthorizationCodeRepository.instance }
    register(:client_repository) { Infrastruture::ClientRepository.instance }

    register(:oauth_service) { Infrastruture::OAuthService.instance }
    register(:authentication_service) { AuthenticationService.instance }
  end
end