require 'singleton'

module PasswordStorage
  module Authentication
    module Infrastruture
      class OAuthService
        include BCrypt
        include Singleton

        def initialize
          @user_repository = resolve :user_repository
          @access_token_repository = resolve :access_token_repository
          @refresh_token_repository = resolve :refresh_token_repository
          @client_repository = resolve :client_repository
        end

        def to_bearer_token(access_token, with_refresh_token = false)
          bearer_token = Rack::OAuth2::AccessToken::Bearer.new(
            access_token: access_token.token,
            expires_in: access_token.expires_in
          )
          if with_refresh_token
            refresh_token = build_refresh_token(access_token.user_id)
            bearer_token.refresh_token = refresh_token.token  
          end

          bearer_token
        end

        def build_access_token(user_id=nil)
          token = Domain::AccessToken.new
          token.token = SecureRandom.base64(32)
          token.expires_in = 15.minutes
          token.expires_at = Time.now + token.expires_in
          token.user_id = user_id if user_id

          @access_token_repository.save token
        end

        def build_refresh_token(user_id=nil)
          token = Domain::RefreshToken.new
          token.token = SecureRandom.base64(32)
          token.expires_in = 14.days
          token.expires_at = Time.now + token.expires_in
          token.user_id = user_id if user_id
          
          @refresh_token_repository.save token
        end
      
        def authorize(env)
          Rack::OAuth2::Server::Token.new do |req, res|
            client = @client_repository.find_by_client_id(req.client_id)
            req.invalid_client! unless client

            authorization_class = self.class.const_get(classify(req.grant_type))
            res.access_token = authorization_class.validate(client, req)
          end.call(env)
        end

        def classify(symbol)
          symbol.to_s.split('_').map(&:capitalize).join
        end

        class AuthorizationCode
          def self.validate(client, req)
            authorization_code_repository = resolve :authorization_code_repository
            oauth_service = resolve :oauth_service

            req.invalid_grant! unless authorization_code_repository.find_by_code(req.code)
            access_token = oauth_service.build_access_token
            oauth_service.to_bearer_token(access_token, false)
          end
        end

        class RefreshToken
          def self.validate(client, req)
            refresh_token_repository = resolve :refresh_token_repository
            oauth_service = resolve :oauth_service

            refresh_token = refresh_token_repository.find_by_token(req.refresh_token)

            req.invalid_grant! unless refresh_token
            req.invalid_grant! if Time.now >= refresh_token.expires_at

            access_token = oauth_service.build_access_token(refresh_token.user_id)
            oauth_service.to_bearer_token(access_token, false)
          end
        end

        class ClientCredentials
          def self.validate(client, req)
            client_repository = resolve :client_repository
            oauth_service = resolve :oauth_service

            req.invalid_grant! unless client.client_secret == req.client_secret
            access_token = oauth_service.build_access_token
            oauth_service.to_bearer_token(access_token, false)
          end
        end

        class Password
          def self.validate(client, req)
            user_repository = resolve :user_repository
            oauth_service = resolve :oauth_service

            user = user_repository.find_by_email(req.username)

            if user and user.verify_password(req.password)
              req.invalid_grant! unless client.client_secret == req.client_secret
              access_token = oauth_service.build_access_token(user.id)
              oauth_service.to_bearer_token(access_token, true)
            else
              req.invalid_grant!
            end
          end
        end
      end
    end
  end
end