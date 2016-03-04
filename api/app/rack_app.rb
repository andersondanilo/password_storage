require 'rack/cors'
require 'rack/oauth2'

module PasswordStorage

  class RackApp
    def initialize
    end

    def self.instance
      @instance ||= Rack::Builder.new do
        use Rack::Cors do
          allow do
            origins '*'
            resource '*', headers: :any, methods: :any
          end
        end

        use Rack::Static,
          :urls => ["/loaderio-2c26843b682c2da3001918c156d98531.txt"],
          :root => "public"

        use Rack::OAuth2::Server::Resource::Bearer, 'Password Storage' do |req|
          access_token = access_token_repository.find_by_token(req.access_token)
          access_token || req.invalid_token!
        end

        run PasswordStorage::API
      end.to_app
    end

    def call(env)
      PasswordStorage::API.call(env)
    end

  end

end