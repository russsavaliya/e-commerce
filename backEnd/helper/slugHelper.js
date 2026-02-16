const generateSlug = (text) =>
    text
        .toLowerCase()
        .trim()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");

module.exports = { generateSlug };
