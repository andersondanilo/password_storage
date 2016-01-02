require 'thread'


module PasswordStorage
  module Core

    module Infrastruture
      class Converter
        include Singleton

        ConverterStrategy = Struct.new(
          :from_class,
          :to_class,
          :function
        )

        def initialize
          @strategies = []
          @semaphore = Mutex.new
        end

        def register(direction, &function)
          direction = direction.flatten
          from_class = direction[0]
          to_class = direction[1]

          @semaphore.synchronize do
            @strategies << ConverterStrategy.new(from_class, to_class, function)
          end
        end

        # List alternatives classes to convert to
        def alternatives(from_class)
          accepted_strategies = @strategies.select do |strategy|
            strategy.from_class == from_class
          end
          accepted_strategies.map { |s| s.to_class }
        end

        def convert(direction)
          direction = direction.flatten
          from_object = direction[0]
          from_class = from_object.class
          to_class = direction[1]

          strategy = @strategies.find do |strategy|
            strategy.to_class == to_class and
            strategy.from_class == from_class
          end

          if strategy
            strategy.function.call(from_object)
          else
            raise Exception.new("No strategy found for converter")
          end
        end

      end
    end
  end
end