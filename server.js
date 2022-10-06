var app = require('express')();
var bodyParser = require('body-parser');
const { request } = require('express');
var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/db_mongo');

var Product = require('./model/product');
var WishList = require('./model/wishlist');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.post('/product', function (req, res){
    var product = new Product(req.body);
    product.save(function(err, savedProduct) {
        if (err){
            res.status(500).send({error:"Could not save the product!!"});
        } else {
            res.send(savedProduct);
        }
    });
});
app.get('/product', function (req,res) {
    Product.find({}, function(err, products) {
       if (err) {
            res.status(500).send({error: "There is an error!!"})
       } else {
            res.send(products);
       }
    });
});
app.get('/wishlist', function(req,res) {
    WishList.find({}).populate({path:'products', model:'Product'}).exec(function(err, wishlist){
        if (err) {
            res.status(500).send({error: "Could not print your wishlists!!"});
        } else {
            res.send(wishlist);
        }
    });
});
app.post('/wishlist', function(req,res) {
    var wishlist = new WishList();
    wishlist.title = req.body.title;
    wishlist.save(function(err, newWishlist) {
        if (err) {
            res.status(500).send({error: "error with creating wishlist!!"});
        } else {
            res.send(newWishlist);
        }
    })
})
app.put('/wishlist/product/add', function(req,res) {
    Product.findOne({_id: req.body.productId}, function(err, product){
        if (err) {
            res.status(500).send({error: "Could not add product Id!!"})
        } else {
            WishList.updateOne({_id:req.body.wishListId}, {$addToSet:{products: product._id}}, function(err, wishList) {
                if (err) {
                    res.status(500).send({error:"Could not add to wishlist!!"});
                } else {
                    res.send("Successfully added to wishlist");
                }
            });
        }
    });
});

app.listen(3000, function() {
    console.log("API running on port 3000...");
})