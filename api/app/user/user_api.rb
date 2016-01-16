module PasswordStorage
  module User
    class UserApi < Grape::API

      namespace :users do

        namespace do 
          http_basic do |client_id, client_secret|
            client = client_repository.find_by_client_id(client_id)
            client && client.client_secret == client_secret
          end

          desc "Register an user"
          params do
            group :data, type: Hash do
              requires :type, type: String, regexp: /^users$/
              group :attributes, type: Hash do
                requires :name, type: String
                requires :email, type: String
                requires :password, type: String
              end
            end
          end
          post "/" do
            user_attributes = params[:data][:attributes]
            user = Domain::User.new
            user.name = user_attributes[:name]
            user.email = user_attributes[:email]
            user.password = user_attributes[:password]

            validator = user_service.make_validator user

            if validator.valid?
              user_service.register(user)
              present user, with: resource_presenter
            else
              status 400
              present validator, with: validator_presenter
            end
          end
        end

        desc "Return current user information"
        get "/current" do
          access_token = require_access_token
          user = user_repository.find(access_token.user_id)
          present user, with: resource_presenter
        end

        desc "Update informations"
        params do
          group :data, type: Hash do
            requires :type, type: String, regexp: /^users$/
            group :attributes, type: Hash do
              requires :name, type: String
              requires :old_password, type: String
              requires :new_password, type: String
            end
          end
        end
        post "/current/update_informations" do
          access_token = require_access_token
          user = user_repository.find(access_token.user_id)

          validator = user_service.make_update_information_validator user, params[:data][:attributes]

          if validator.valid?
            user.name = params[:data][:attributes][:name]
            user.password = params[:data][:attributes][:new_password]

            user_repository.save(user)

            present user, with: resource_presenter
          else
            status 400
            present validator, with: validator_presenter
          end
        end

      end

    end
  end
end