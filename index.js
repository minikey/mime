let fs = require('fs');

const MIMETYPE = [{
    type: 'image/jpeg',
    tags: [
      'FFD8FFE0',
      'FFD8FFE1',
      'FFD8FFE2',
      'FFD8FFE3'
    ]
  }, {
    type: 'image/png',
    tags: ['89504E47']
  }, {
    type: 'image/gif',
    tags: [
      '474946383761',
      '474946383961'
    ]
  }
];

const MIMETYPE_MAP = MIMETYPE.reduce((container, v) => {
  container[v.type] = v.tags;
  return container;
}, {});

/**
 * 打开文件
 * 
 * @param {any} file 
 * @param {any} flags 
 * @param {any} mode 
 * @returns 
 */
function openFile(file, flags, mode) {
  return new Promise(function (resolve, reject) {
    fs.open(file, flags, mode, function (err, fd) {
      if (err) {
        reject(err);
      } else {
        resolve(fd);
      }
    });
  });
}

/**
 * 读取文件
 * 
 * @param {any} fd 
 * @param {any} buffer 
 * @param {any} offset 
 * @param {any} length 
 * @param {any} position 
 * @returns 
 */
function readFile(fd, buffer, offset, length, position) {
  return new Promise(function (resolve, reject) {
    fs.read(fd, buffer, offset, length, position, function (err, bytesread, buf) {
      if (err) {
        reject(err);
      } else {
        resolve(bytesread, buffer);
      }
    });
  });
}

/**
 * 读取指定bytes到buffer
 * 
 * @param {any} file 
 * @param {any} bytes 
 * @returns 
 */
async function readBytes(file, bytes) {
  let fd;
  let buffer;
  try {
    fd = await openFile(file, 'r');

    let arr = new Uint8Array(bytes);
    buffer = new Buffer(arr.buffer);

    let bytesread = await readFile(fd, buffer, 0, bytes, 0);

    await closeFd(fd);
  } catch (e) {
    console.error(e);
    if (fd) {
      await closeFd(fd);
    }
    return null;
  }

  return buffer;
}

/**
 * 关闭文件
 * 
 * @param {any} fd 
 * @returns 
 */
function closeFd(fd) {
  return new Promise(function (resolve, reject) {
    fs.close(fd, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

let mime = {
  readBytes: readBytes,
  getType: async function (file) {
    let flag = false;
    for (let i = 0, l = MIMETYPE.length; i < l; i++) {
      flag = await this.is(file, MIMETYPE[i].type);
      if (flag) {
        return MIMETYPE[i].type;
        break;
      }
    }
    return '';
  },
  is: async function (file, mimetype) {
    let tags = MIMETYPE_MAP[mimetype];
    let rs = false;

    if (!tags) {
      throw new Error('no support for this MIMETYPE');
    }

    let bytes = tags[0].length >> 1;
    let buffer = await this.readBytes(file, bytes);

    if (buffer) {
      let tag = new Array(buffer.length);
      for (let i = 0, l = buffer.length; i < l; i++) {
        tag[i] = buffer[i].toString(16).toUpperCase();
      }
      return tags.includes(tag.join(''));
    }

    return rs;
  }
};

module.exports = mime;