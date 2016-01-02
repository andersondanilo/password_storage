FROM andersondanilo/centos-ruby

RUN gem install bundle

RUN yum -y install gcc

RUN yum -y install make

RUN mkdir /code
WORKDIR /code
ADD Gemfile /code/
RUN bundle install

RUN gem install rake

