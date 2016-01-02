module SharedVariables
  extend RSpec::SharedContext

  let(:client) do
    client = create(:client)
    {
      id: client.client_id,
      secret: client.client_secret
    }
  end
end