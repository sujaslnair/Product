/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');
const shim = require("fabric-shim");


class ProductContract extends Contract {



// Exists Function
//**************************************** */ 

    async productExists(ctx, productId) {
        const buffer = await ctx.stub.getState(productId);
        return (!!buffer && buffer.length > 0);
    }

//Add -Product

    async addProduct(ctx, productId, productName, productPrice, productQty,productCat,productDes) {
        let logger = shim.newLogger("Chaincode --> ");
        let CID = new shim.ClientIdentity(ctx.stub);
        let mspID = CID.getMSPID();
        logger.info("MSPID : "+ mspID);
    
            const exists = await this.productExists(ctx,productId);
            if (exists) {
                throw new Error(`A product with Id: ${productId} already exists`);
            }
            const asset = {
                productId,
                productName,
                productPrice,
                productQty,
                productCat,
                productDes,               
                assetType:"Product"
            };
            const buffer = Buffer.from(JSON.stringify(asset));
            logger.info("logger asset"+asset);
            await ctx.stub.putState(productId, buffer);           
    }

//view particular product

    async readProduct(ctx, productId) {
        let logger = shim.newLogger("Chaincode --> ");
        const exists = await this.productExists(ctx, productId);
        if (!exists) {
            throw new Error(`A product with Id: ${productId} does not exist`);
        }
        const buffer = await ctx.stub.getState(productId);
        const asset = JSON.parse(buffer.toString());
        logger.info("logger readProduct"+asset);
        return asset;
    }
//Remove a product

    async deleteProduct(ctx, productId) {
        let logger = shim.newLogger("Chaincode --> ");
        let CID = new shim.ClientIdentity(ctx.stub);
        let mspID = CID.getMSPID();
        logger.info("MSPID : "+ mspID);

            const exists = await this.productExists(ctx, productId);
            if (!exists) {
                throw new Error(`A product with Id: ${productId} does not exist`);
            }
            await ctx.stub.deleteState(productId);
        
    }

// View All Products

async queryAllProduct(ctx) {

    const allResults = [];
    for await (const {key, value} of ctx.stub.getStateByRange("","")) {
        const strValue = Buffer.from(value).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            record = strValue;
        }
        allResults.push({ Key: key, Record: record });
       }
    console.info(allResults);
    console.info("working")
    return JSON.stringify(allResults);
}
//Delete all products
async deleteAllProduct(ctx) {
    
    const allResults = [];
    for await (const {key, value} of ctx.stub.getStateByRange("","")) {
        const strValue = Buffer.from(value).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
        } catch (err) {
            console.log(err);
            record = strValue;
        }
        allResults.push({ Key: key, Record: record });
        await ctx.stub.deleteState(key);
    }
    console.info(allResults);
    console.info("working")
    return JSON.stringify(allResults);
}

}

module.exports = ProductContract;
