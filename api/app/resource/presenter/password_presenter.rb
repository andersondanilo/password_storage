module PasswordStorage
  module Resource
    module Presenter
      class PasswordPresenter < Grape::Entity

        def self.type_name
          'passwords'
        end

        def self.url(password, env)
          "/categories/#{password.category_uuid}/passwords/#{password.uuid}"
        end

        expose :uuid
        expose :rev
        expose :title
        expose :username
        expose :password
        expose :category_uuid
        expose :informations
      end
    end
  end
end