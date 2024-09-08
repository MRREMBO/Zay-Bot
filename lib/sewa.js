const fs = require('fs');
const toMs = require('ms');

/**
 * Add Sewa group.
 * @param {String} gid 
 * @param {String} subject
 * @param {String} link
 * @param {String} expired 
 * @param {Object} _dir 
 */
const addSewaGroup = (gid, subject, link, expired, _dir) => {
    let position = _dir.findIndex((group) => group.id === gid);
    
    if (position !== -1) {
        _dir[position].expired = Date.now() + toMs(expired);
    } else {
        const obj = {
            id: gid,
            group: subject,
            linkgc: link,
            expired: Date.now() + toMs(expired)
        };
        _dir.push(obj);
    }

    // Save to file
    fs.writeFileSync('./database/sewa.json', JSON.stringify(_dir));
};

/**
 * Get sewa group position.
 * @param {String} gid 
 * @param {Object} _dir 
 * @returns {Number | undefined}
 */
const getSewaPosition = (gid, _dir) => {
    return _dir.findIndex((group) => group.id === gid);
};

/**
 * Get sewa group expire.
 * @param {String} gid 
 * @param {Object} _dir 
 * @returns {Number | undefined}
 */
const getSewaExpired = (gid, _dir) => {
    const position = getSewaPosition(gid, _dir);
    return position !== -1 ? _dir[position].expired : undefined;
};

/**
 * Check if a group is sewa.
 * @param {String} gid 
 * @param {Object} _dir 
 * @returns {Boolean}
 */
const checkSewaGroup = (gid, _dir) => {
    return _dir.some((group) => group.id === gid);
};

/**
 * Constantly checking sewa expiration.
 * @param {object} conn
 * @param {Object} _dir 
 */
const expiredCheck = async (conn, _dir) => {
    let expiredGroups = [];

    _dir.forEach((group, index) => {
        if (Date.now() >= group.expired) {
            expiredGroups.push(index);
        }
    });

    for (let position of expiredGroups) {
        console.log(`Sewa expired: ${_dir[position].id}`);
        
        let getGroups = await conn.groupFetchAllParticipating();
        let groupIds = Object.values(getGroups).map(group => group.id);

        if (!_dir[position].id) continue;

        if (groupIds.includes(_dir[position].id)) {
            let message = `Waktu sewa di grup ini sudah habis, bot akan keluar otomatis`;

            // Send message and leave group
            await conn.sendMessage(_dir[position].id, { text: message });
            await conn.groupLeave(_dir[position].id);

            // Remove group from directory
            _dir.splice(position, 1);
            fs.writeFileSync('./database/sewa.json', JSON.stringify(_dir));
        } else {
            console.log('Menghapus data sewa yang tidak tersedia');
            _dir.splice(position, 1);
            fs.writeFileSync('./database/sewa.json', JSON.stringify(_dir));
        }
    }
};

/**
 * Get all premium user IDs.
 * @param {Object} _dir 
 * @returns {String[]}
 */
const getAllPremiumUser = (_dir) => {
    return _dir.map((group) => group.id);
};

module.exports = {
    addSewaGroup,
    getSewaExpired,
    getSewaPosition,
    expiredCheck,
    checkSewaGroup,
    getAllPremiumUser
};
