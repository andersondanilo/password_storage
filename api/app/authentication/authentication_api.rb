module PasswordStorage
  module Authentication

    module OAuthErrorFormatter
      def self.call message, backtrace, options, env
        { :error => 'invalid_grant', :error_description => message }.to_json
      end
    end

    class AuthenticationApi < Grape::API

      error_formatter :json, OAuthErrorFormatter
      
      helpers do
        def authorization_response(env)
          authentication_service.authorize(env)
        end

        def send_oauth_response response
          # status
          status response[0]

          # headers
          response[1].each do |key, value|
            header key, value
          end

          # body
          body JSON.parse(response[2].body.first)
        end
      end

      namespace :authentication do

        desc "Get or refresh a token"
        params do
          requires  :grant_type,
                    type: Symbol,
                    #values: [:authorization_code, :refresh_token, :client_credentials, :password],
                    values: [:password, :refresh_token],
                    desc: 'The grant type.'
          optional  :code,
                    type: String,
                    desc: 'The authorization code.'
          requires  :client_id,
                    type: String,
                    desc: 'The client id.'
          optional  :client_secret,
                    type: String,
                    desc: 'The client secret.'
          optional  :refresh_token,
                    type: String,
                    desc: 'The refresh_token.'
        end
        post :token do
          response = authorization_response(env)
          send_oauth_response response
        end

      end
    end
  end
end