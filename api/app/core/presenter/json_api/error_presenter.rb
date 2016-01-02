module PasswordStorage
  module Core
    module Presenter
      module JsonApi

        class ErrorPresenter
          def self.call message, backtrace, options, env
            {
              :errors => [
                {
                  :detail => message
                }
              ]
            }.to_json
          end
        end

      end
    end
  end
end