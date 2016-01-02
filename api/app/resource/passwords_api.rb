module PasswordStorage
  module Resource
    class PasswordsApi < Grape::API

      params do
        requires :category, type: String
      end
      resource "categories/:category/passwords" do
        after_validation do
          access_token = require_access_token
          category_repository = Infrastruture::CategoryRepository.new(access_token.user.id)
          @category = category_repository.find_by_uuid(params[:category])
          error!('Not Found', 404) unless @category
        end

        desc "Create an new password"
        params do
          group :data, type: Hash do
            requires :type, type: String, regexp: /^passwords$/
            group :attributes, type: Hash do
              requires :uuid, type: String
              optional :rev, type: String
              requires :title, type: String
              requires :username, type: String
              requires :password, type: String
              group :informations, type: Array do
                requires :name, type: String
                requires :value, type: String
              end
            end
          end
        end
        post '/' do
          access_token = require_access_token
          password_repository = Infrastruture::PasswordRepository.new(access_token.user.id)

          attributes = params[:data][:attributes]

          password = Domain::Password.new
          password.rev = nil
          password.uuid = attributes[:uuid]
          password.title = attributes[:title]
          password.username = attributes[:username]
          password.password = attributes[:password]
          password.category_uuid = @category.uuid
          password.informations = attributes[:informations]

          password = password_repository.save(password)
          
          present password, with: resource_presenter
        end

        desc "Return an password"
        get ':uuid' do
          access_token = require_access_token
          password_repository = Infrastruture::PasswordRepository.new(access_token.user.id)
          
          password = password_repository.find_by_uuid(params[:uuid])

          unless password.nil?
            present password, with: resource_presenter
          else
            error!('Not Found', 404)
          end
        end

        desc "List all passwords"
        get '/' do
          access_token = require_access_token
          password_repository = Infrastruture::PasswordRepository.new(access_token.user.id)

          passwords = password_repository.find_by_category(@category.id)

          present passwords, with: resource_presenter
        end

        desc "Delete an password"
        delete ':uuid' do
          access_token = require_access_token
          password_repository = Infrastruture::PasswordRepository.new(access_token.user.id)
          
          password = password_repository.find_by_uuid(params[:uuid])
          unless password.nil?
            if password.category_uuid == @category.uuid
              password_repository.delete_by_uuid params[:uuid]
              present password, with: resource_presenter
            else
              error!('Not Found', 404)
            end
          else
            error!('Not Found', 404)
          end
        end

        desc "Update an password"
        params do
          group :data, type: Hash do
            requires :type, type: String, regexp: /^passwords$/
            group :attributes, type: Hash do
              requires :title, type: String
              requires :username, type: String
              requires :password, type: String
              group :informations, type: Array do
                requires :name, type: String
                requires :value, type: String
              end
            end
          end
        end
        patch ':uuid' do
          access_token = require_access_token
          password_repository = Infrastruture::PasswordRepository.new(access_token.user.id)

          attributes = params[:data][:attributes]
          
          password = password_repository.find_by_uuid(params[:uuid])

          unless password.nil?
            if password.category_uuid == @category.uuid
              password.title = attributes[:title]
              password.username = attributes[:username]
              password.password = attributes[:password]
              password.informations = attributes[:informations]

              password = password_repository.save(password)

              present password, with: resource_presenter
            else
              error!('Not Found', 404)
            end
          else
            error!('Not Acceptable', 406)
          end
        end

      end


    end
  end
end