const joi = require("joi");

const addItemOnsaleDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  item_id: joi.string().allow().label("Item id"),
  title: joi.string().required().label("Title"),
  description: joi.string().required().label("Description"),
  price: joi.string().required().label("Price"),
});

const removeItemfromSaleDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  item_id: joi.string().allow().label("Item id"),
});

const getAllPublicItemsDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  search: joi.string().allow().label("Search"),
  sort: joi.string().allow().label("Sort"),
  page: joi.string().allow().label("Page"),
  limit: joi.string().allow().label("Limit"),
});

const getPublicItemDetailsDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  public_item_id: joi.string().required().label("Public item id"),
});

module.exports = {
  getAllPublicItemsDto,
  getPublicItemDetailsDto,
  addItemOnsaleDto,
  removeItemfromSaleDto,
};
