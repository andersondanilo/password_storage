module PasswordStorage
  module Core
    module Presenter
      module JsonApi

        class ResourcePresenter < Grape::Entity

          def self.represent(objects, options = {})
            self.new(objects, options)
          end

          expose :data do |resources, options|
            if resources.is_a?(Array)
              resources.map{|resource| represent_one(resource, options) }
            else
              represent_one(resources, options)
            end
          end

          def represent_one(resource, options)
            specific_presenter = resolve("presenter:#{resource.class.name}")

            result = {
              type: specific_presenter.type_name,
              id: (resource.respond_to? 'uuid') ? resource.uuid.to_s : resource.id.to_s,
              attributes: specific_presenter.represent(resource),
              links: {
                'self' => specific_presenter.url(resource, options)
              }
            }

            if specific_presenter.respond_to? "relationships"
              result[:relationships] = specific_presenter.relationships(resource, options)
            end

            result
          end
        end


      end
    end
  end
end