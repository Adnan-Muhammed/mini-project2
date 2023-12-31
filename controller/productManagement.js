// const CategoryDB=require('../../models/category')
const CategoryDB=require('../models/category')
const productDB = require('../models/product');
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: 'public/uploads/' }); 
const fetchCategoryMiddleware =require('../middleware/fetchCategoryData')


const determineIsLogged = (session) => {
    return session.user ? session.user.name : (session.userNew ? session.userNew.name : null);
};



//user side-=-=-=-=-

// const productListUser = async (req, res) => {
//     const isLogged = determineIsLogged(req.session);
//     const { primaryCategories, otherCategories } = await fetchCategoryMiddleware.fetchCategories();
//     const  categoryData  = req.params.id.toUpperCase()
//     try {
//         console.log(565656);
//         const isCategory=await CategoryDB.find({name:categoryData,isAvailable:true})
//         const  product=await productDB.find({isAvailable:true,categoryName:categoryData})
//         if(isCategory&&product){
//             console.log(product)
//             res.render('user/productlist',{isLogged,product,primaryCategories, otherCategories})
//         }
//     } catch (err) {
//         console.error(err);
//     }
// }



//gpt
const productListUser = async (req, res) => {
    const isLogged = determineIsLogged(req.session);
    const { primaryCategories, otherCategories } = await fetchCategoryMiddleware.fetchCategories();
    const categoryData = req.params.id.toUpperCase();
    const page = parseInt(req.query.page) || 1; // Get the page number from the query parameter, default to page 1
    const limit = 2; // Number of items per page

    try {
        const totalProductsCount = await productDB.countDocuments({ isAvailable: true, categoryName: categoryData });
        const totalPages = Math.ceil(totalProductsCount / limit);
        const offset = (page - 1) * limit;

        const products = await productDB.find({ isAvailable: true, categoryName: categoryData })
            .skip(offset)
            .limit(limit);

        res.render('user/productlist', {
            isLogged,
            product: products,
            primaryCategories,
            otherCategories,
            totalPages,
            currentPage: page
        });
    } catch (err) {
        console.error(err);
    }
}

//==-=-=-=-=-=-




//admin side -=-=-=-=-=-

const productListAdmin=async (req,res)=>{
    try{
        const productList=await productDB.find()
        console.log(productList.length);
        if(productList.length>0){
            // console.log('listed',productList);
            res.render('admin/productlist',{productList})
        }else{
            console.log('NO DATA');
            res.render('admin/categorylist')
        }
  
    }catch (err){
        console.error('sorry');
    }
}



const addProduct=async(req,res)=>{
    try{
        console.log('rrrrr');
        const categoryList=await CategoryDB.find({isAvailable:true},{name:1,_id:0})
    res.render('admin/addproduct',{categoryList})
    }catch(err){
        console.error(err);
    }
}





const productadded = async (req, res) => {
    upload.array('images', 6)(req, res, async function (err) {

    if (err instanceof multer.MulterError) {
            return res.status(400).send({ message: 'Multer error' });
        } else if (err) {
            return res.status(500).send({ message: 'Server error' });
        }



        try {
            // if (!req.files || req.files.length === 0) {
            //     return res.status(400).send({ message: 'No files were uploaded.' });
            //     }
            const newImages = req.files.map(file => file.path.substring(6))
            if(req.body.productCategory){
                const newProduct = {
                    name: req.body.productName,
                    price: req.body.productPrice,
                    stock: req.body.productStock,
                    categoryName: req.body.productCategory,
                    description: req.body.productDescription,
                    image: newImages, 
                };
                await productDB.insertMany([newProduct])
                req.session.productAdded=newProduct
            }else{
                const updateProduct = {
                    name: req.body.productName,
                    price: req.body.productPrice,
                    stock: req.body.productStock,
                    description: req.body.productDescription,
                    image: newImages, 
                };
                const productId=req.params.id
                console.log(productId);
                const editing = await productDB.findByIdAndUpdate(
                    productId,
                    updateProduct,
                    // { new: true } 
                  );
            }
            

          
            return res.redirect('/admin/productlist');
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: 'Error adding product' });
        }
    });
};


//-=-=-=-=-



// new codes
const PRODUCTS_PER_PAGE = 8;
const userSideProductlist = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * PRODUCTS_PER_PAGE;

        // Fetch products from your database here, considering your actual data retrieval method
        // For example:
        const products = await productDB.find().skip(skip).limit(PRODUCTS_PER_PAGE);

        // Calculate total product count (assuming you have a Product model)
        const totalProductsCount = await productDB.countDocuments();

        const totalPages = Math.ceil(totalProductsCount / PRODUCTS_PER_PAGE);

        res.render('user/productlist', {
            products,
            totalPages,
            currentPage: page
        });
    } catch (err) {
        console.log('Error:', err);
        return res.status(500).render('error', { message: 'Internal Server Error' });
    }
};

//productUnlist admin
const productUnlist=async(req,res)=>{
    try{
        console.log(1111111);
        const productId=req.params.id
        console.log(productId);
        const  productishere = await productDB.find({_id:productId})
        console.log(productishere);
        const nowproduct=await productDB.updateOne({ _id: productId }, { $set: { isAvailable: false } });
        console.log(nowproduct);
        res.redirect('/admin/productlist')
    }catch(err){
        console.error(err);
    }
}

const productList=async(req,res)=>{
    try{
        console.log(2222);
        const productId=req.params.id
        console.log(productId);
        const  productishere = await productDB.find({_id:productId})
        console.log(productishere);
        const nowproduct=await productDB.updateOne({ _id: productId }, { $set: { isAvailable: true } });
        console.log(nowproduct);
        res.redirect('/admin/productlist')
    }catch(err){
        console.error(err);
    }
}


const productUpdate=async(req,res)=>{
    try{
        const productId=req.params.id
        console.log('updating this product');
        const editProduct= await productDB.findById(productId)
        console.log(editProduct.name);
        res.render('admin/editProduct',{editProduct})
    }catch(err){
    }
}

const productUpdatePost=async(req,res)=>{
    try{
        const updateProduct=req.params.id
        const updatedProduct=await productDB.findById(updateProduct).select('name isAvailable image')
        console.log(updatedProduct);
    }catch(err){
    }
}


const productImgDelete=async(req,res)=>{
    try{
        const productObjectId=req.params.id
        req.session.productId=productObjectId

        const url=req.params.imgUrl
        console.log(121212);
        const imgUrl=`\\uploads\\${url}`
        console.log(imgUrl);

        const img=await productDB.updateOne(
            { _id: productObjectId },
            { $pull: { image: imgUrl } }
          );
          res.redirect(`/admin/productUpdate/${productObjectId}`)
    }catch(err){
        console.error(err);
    }
}




//
const productDetail=async(req,res)=>{
    console.log(1818);
    const isLogged = determineIsLogged(req.session);
    try{
        console.log(isLogged);
        const productId=req.params.id
        console.log(productId,1111);
        const productDetails=await productDB.findById(productId)
        console.log(productDetail);
        console.log(222);

        res.render('user/product-detail',{productDetails,isLogged})
    }catch(err){

    }
}




const userSideproductDetails=(req,res)=>{
    res.render('user/product-details-zoom')
}





module.exports={
    addProduct,
    productadded,
    productListAdmin,
    //new codes
    userSideProductlist,
    userSideproductDetails,
    productListUser,
    productUnlist,
    productList,
    productUpdate,
    productUpdatePost,
    productImgDelete,
    productDetail
    
}