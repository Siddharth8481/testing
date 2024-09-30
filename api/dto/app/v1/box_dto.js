const joi = require("joi");

const buyBoxDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    box_name: joi.string().required().label("Box name"),
    box_size: joi.string().required().label("Box size"),
    box_features_id: joi.string().required().label("Box features id"),
    subscription: joi.string().valid("weekly", "monthly", "yearly").required().label("Subscription"),
    exipiry_date: joi.string().required().label("Expiry date"),
    box_price: joi.string().required().label("Box price"),
});

const editBoxDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    box_id: joi.string().required().label("Box id"),
    box_name: joi.string().required().label("Box name"),
});

const deleteBoxDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    box_id: joi.string().required().label("Box id"),
});

const boxDetailsDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    box_id: joi.string().required().label("Box id"),
});

const addItemDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    box_id: joi.string().required().label("Box id"),
    item_name: joi.string().required().label("Item name"),
    descrption: joi.string().required().label("Descrption"),
    pickup_address_id: joi.string().required().label("Pickup address id"),
});

const editItemDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    item_id: joi.string().required().label("Item id"),
    box_id: joi.string().required().label("Box id"),
    item_name: joi.string().required().label("Item name"),
    descrption: joi.string().required().label("Descrption"),
    pickup_address_id: joi.string().required().label("Pickup address id"),
});

const deleteItemDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    item_id: joi.string().required().label("Item id"),
    box_id: joi.string().required().label("Box id"),
});

const itemDetailsDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    item_id: joi.string().required().label("Item id"),
});

const boxListDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    search: joi.string().allow().label("Search"),
    sort: joi.string().allow().label("Sort"),
    page: joi.string().allow().label("Page"),
    limit: joi.string().allow().label("Limit"),
    box_size: joi.string().allow().label("Box size"),
    subscription: joi.string().allow().label("Subscription"),
    features: joi.string().allow().label("Features"),
});

const boxItemListDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    box_id: joi.string().required().label("Box id"),
    search: joi.string().allow().label("Search"),
    page: joi.string().allow().label("Page"),
    limit: joi.string().allow().label("Limit"),
});

const allItemListDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    search: joi.string().allow().label("Search"),
    sort: joi.string().allow().label("Sort"),
    page: joi.string().allow().label("Page"),
    limit: joi.string().allow().label("Limit"),
});

const allSaleItemsListsDto = joi.object().keys({
    user_id: joi.string().allow().label("User id"),
    page: joi.string().allow().label("Page"),
    limit: joi.string().allow().label("Limit"),
});

module.exports = {
    buyBoxDto,
    editBoxDto,
    boxDetailsDto,
    boxListDto,
    boxItemListDto,
    itemDetailsDto,
    deleteBoxDto,
    allItemListDto,
    allSaleItemsListsDto,
    addItemDto,
    editItemDto,
    deleteItemDto,
};