module PasswordStorage
  module Resource
    class CategoriesApi < Grape::API

      namespace :categories do
        desc "Create an new category"
        params do
          group :data, type: Hash do
            requires :type, type: String, regexp: /^categories$/
            group :attributes, type: Hash do
              requires :uuid, type: String
              optional :rev, type: String
              requires :name, type: String
            end
          end
        end
        post '/' do
          access_token = require_access_token
          category_repository = Infrastruture::CategoryRepository.new(access_token.user.id)

          attributes = params[:data][:attributes]

          category = Domain::Category.new
          category.rev = nil
          category.uuid = attributes[:uuid]
          category.name = attributes[:name]

          category = category_repository.save(category)
          
          present category, with: resource_presenter
        end

        desc "List all categories"
        get '/' do
          access_token = require_access_token
          category_repository = Infrastruture::CategoryRepository.new(access_token.user.id)

          categories = category_repository.find_all()

          present categories, with: resource_presenter
        end

        desc "Delete an category"
        delete '/:uuid' do
          access_token = require_access_token
          category_repository = Infrastruture::CategoryRepository.new(access_token.user.id)
          
          category = category_repository.find_by_uuid(params[:uuid])
          unless category.nil?
            category_repository.delete_by_uuid params[:uuid]
            present category, with: resource_presenter
          else
            error!('Not Found', 404)
          end
        end

        desc "Update an category"
        params do
          group :data, type: Hash do
            requires :type, type: String, regexp: /^categories$/
            group :attributes, type: Hash do
              requires :uuid, type: String
              requires :name, type: String
            end
          end
        end
        patch '/:uuid' do
          access_token = require_access_token
          category_repository = Infrastruture::CategoryRepository.new(access_token.user.id)

          attributes = params[:data][:attributes]
          
          category = category_repository.find_by_uuid(params[:uuid])

          unless category.nil?
            category.rev = attributes[:rev]
            category.name = attributes[:name]

            category = category_repository.save(category)

            present category, with: resource_presenter
          else
            error!('Not Found', 404)
          end
        end

      end


    end
  end
end