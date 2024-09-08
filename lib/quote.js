/**
 * Base By Siputzx
 * Created On 22/2/2024
 * Contact Me on wa.me/6288292024190
 * Supported By Gpt Assistant 
*/

const axios = require('axios');

const quote = async (text, name, avatar) => {
  const json = {
    "type": "quote",
    "format": "png",
    "backgroundColor": "#FFFFFF",
    "width": 512,
    "height": 768,
    "scale": 2,
    "messages": [
      {
        "entities": [],
        "avatar": true,
        "from": {
          "id": 1,
          "name": name,
          "photo": {
            "url": avatar,
          }
        },
        "text": text,
        "replyMessage": {}
      }
    ]
  };

  const res = await axios.post('https://bot.lyo.su/quote/generate', json, {
    headers: {'Content-Type': 'application/json'}
  });

  const buffer = Buffer.from(res.data.result.image, 'base64');

  return { 
    result: buffer
  };
};

module.exports = { quote };
