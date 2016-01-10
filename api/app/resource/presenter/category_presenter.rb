module PasswordStorage
  module Resource
    module Presenter
      class CategoryPresenter < Grape::Entity

        expose :uuid
        expose :rev
        expose :name
        expose :special

        def self.type_name
          'categories'
        end

        def self.url(category, options)
          "/categories/#{category.uuid}"
        end

        def self.relationships(category, options)
          
          password_repository = Infrastruture::PasswordRepository.new(category.user_id)
          passwords = password_repository.find_by_category(category.id)

          {
            passwords: {
              links: {
                self: "/categories/#{category.uuid}/passwords"
              },
              data: passwords.map do |password|
                {
                  type: "passwords",
                  id: password.uuid,
                  meta: {rev: password.rev}
                }
              end
            }
          }
        end

      end
    end
  end
end