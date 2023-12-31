const session = require('express-session');
const CategoryDB = require('../models/category');






const categorylist=async (req,res)=>{
    try{
        const categoryList=await CategoryDB.find()
        if(categoryList.length>0){
            console.log('listed');
            res.render('admin/categorylist',{categoryList})
        }else{
            console.log('NO DATA');
            res.render('admin/categorylist')
            }
        }catch (err){
            console.error(err);
        }
}







const addCategory=(req,res)=>{
        res.render('admin/addCategory')
}



const categoryAddedPost= async (req,res)=>{
    try{
        const categoryData={
            name:req.body.categoryName.trim().toUpperCase()
        }
        await CategoryDB.insertMany([categoryData]);
        console.log(categoryData,"categoryData2");
            res.redirect('/admin/categoryList')
    }catch (err){
        console.error(err);
    }
}

const checkCategory = async (req, res) => {
    try {
        console.log('hgfhdgcfc');
        const categoryName = req.body.categoryName.trim().toUpperCase();

        const existingCategory = await CategoryDB.findOne({ name: categoryName });

        if (existingCategory) {
            res.json({ exists: true }); // Category exists
            console.log("existing");
        } else {
            res.json({ exists: false }); // Category doesn't exist
            console.log("not existing");
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




const hide=  async (req,res)=>{
    console.log('middleware1');
        try{
            const categoryIdToUpdate=req.params.id
            await CategoryDB.find({_id:categoryIdToUpdate},{name:1,_id:0})
            await CategoryDB.updateOne({ _id: categoryIdToUpdate }, { $set: { isAvailable: false } });
    res.redirect('/admin/categoryList')
        } catch (err){
            console.error(err);
        }

}


const show=  async (req,res)=>{
        try{
            const categoryIdToUpdate=req.params.id
            await CategoryDB.find({_id:categoryIdToUpdate},{name:1,_id:0})
            await CategoryDB.updateOne({ _id: categoryIdToUpdate }, { $set: { isAvailable: true } });
    res.redirect('/admin/categoryList')
        } catch (err){
            console.error(err);
        }
    }
       









module.exports={
    categorylist,
    addCategory,
    categoryAddedPost,
    show,
    hide,
    checkCategory,
}