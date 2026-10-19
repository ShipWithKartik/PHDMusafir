// Keys for admin-replaceable site images (see context/SiteImagesContext.jsx)

export const normaliseImageKey = (key = '') => String(key).trim().toLowerCase();

/** Key for a city's cover (Journal city card + city page banner). */
export const cityImageKey = (city = '') => `city:${normaliseImageKey(city)}`;
