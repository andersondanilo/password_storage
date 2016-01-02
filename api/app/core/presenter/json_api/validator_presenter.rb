module PasswordStorage
  module Core
    module Presenter
      module JsonApi

        class ValidatorPresenter < Grape::Entity
          expose :errors do |validator, options|
            errors = []
            validator.errors.messages.each_pair do |attribute, messages|
              messages.each do |message|
                errors << {
                  detail: message,
                  source: {
                    pointer: "/data/attributes/#{attribute}"
                  }
                }
              end
            end
            errors
          end
        end

      end
    end
  end
end