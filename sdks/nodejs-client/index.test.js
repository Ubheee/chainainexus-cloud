import { CAN20Client, BASE_URL, routes } from ".";

import axios from 'axios'

jest.mock('axios')

describe('Client', () => {
  let can20Client
  beforeEach(() => {
    can20Client = new CAN20Client('test')
  })

  test('should create a client', () => {
    expect(can20Client).toBeDefined();
  })
  // test updateApiKey
  test('should update the api key', () => {
    can20Client.updateApiKey('test2');
    expect(can20Client.apiKey).toBe('test2');
  })
});

describe('Send Requests', () => {
  let can20Client

  beforeEach(() => {
    can20Client = new CAN20Client('test')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should make a successful request to the application parameter', async () => {
    const method = 'GET'
    const endpoint = routes.application.url
    const expectedResponse = { data: 'response' }
    axios.mockResolvedValue(expectedResponse)

    await can20Client.sendRequest(method, endpoint)

    expect(axios).toHaveBeenCalledWith({
      method,
      url: `${BASE_URL}${endpoint}`,
      params: null,
      headers: {
        Authorization: `Bearer ${can20Client.apiKey}`,
        'Content-Type': 'application/json',
      },
      responseType: 'json',
    })

  })

  it('should handle errors from the API', async () => {
    const method = 'GET'
    const endpoint = '/test-endpoint'
    const errorMessage = 'Request failed with status code 404'
    axios.mockRejectedValue(new Error(errorMessage))

    await expect(can20Client.sendRequest(method, endpoint)).rejects.toThrow(
      errorMessage
    )
  })
})