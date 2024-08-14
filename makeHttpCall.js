const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const axios= require('axios');

/**
 * Makes an HTTP Call using Axios.
 *
 * @param {string} method - The HTTP method (e.g., 'get', 'post', 'put', 'delete').
 * @param {string} url - The URL to send the HTTP request to.
 * @param {object|null} data - The data to send with the request (optional, used for POST/PUT requests).
 * @param {object} headers - The HTTP headers to include in the request (optional).
 *
 * @returns {Promise<any>} A Promise that resolves with the response when the request is successful.
 * @throws {Error} If an error occurs during the request.
 */

async function makeHttpCall(method, url, data, headers) {
  // console.log("URL:"+url+"\nbody:"+data+"\nHeaders"+JSON.stringify(headers)+"\nmethod:"+method)
  // console.log(data);
  // var reqoptions={
  //   method: method,
  //   headers:  headers,
  //   body : JSON.stringify(data),
  // }
  // try {
  //   const response = await fetch(url,reqoptions)
  //   console.log("Reposnse::"+JSON.stringify(response.text()));
  //   return response.text();
  // } catch (error) {
  //   throw error;
  // }
  try
  {
  const response =await axios({
    url,
    headers,
    data,
    method
  })
  // console.log(response);
  return response;
}
catch (error)
{
  throw error
}


}


module.exports = {
    makeHttpCall
}