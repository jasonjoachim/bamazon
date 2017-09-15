//set up variables for the required packages
var mysql = require("mysql");
var inquirer = require("inquirer");

// connect to sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3475,

  user: "root",

  password: "root",
  database: "bamazondb"
});

connection.connect(function(err) {
  if (err) throw err;
  // console.log("connected as id " + connection.threadId);
 
});
var start = function(){
// display all of the items available for sale. Include the ids, names, and prices of products for sale.


connection.query("SELECT * FROM products", function(err, res) {
  console.log("ITEM ID." + " | " + "PRODUCT" + " | " +  "DEPARTMENT" + " | " + "PRICE" + " | " + "IN-STOCK");
  for (var i = 0; i < res.length; i++) {
    
    console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + res[i].price + " | " + res[i].stock_quantity);
  }
  console.log("-----------------------------------");
  purchase();
})
}

//  prompt users with two messages.
var purchase = function(){
  inquirer.prompt([{
    //ask them the ID of the product they would like to buy.
		name: "item",
		type: "input",
		message: "What item you would like to purchase?"
	}, {
    // ask how many units of the product they would like to buy.
		name: "inventory",
		type: "input",
		message: "How many units of the item would you like?",
		// check if your store has enough of the product to meet the customer's request.
    }]).then(function(answer){

     connection.query("SELECT * FROM products WHERE ?", {item_id:answer.item}, function(err,res){
       if (err) throw error;
       //user's input for quantity - available quantity from database
       if (parseInt(answer.inventory)<= res[0].stock_quantity){
         var cartCost = (parseInt(answer.inventory))*res[0].price;
         console.log("Your cart = $" + cartCost);
         //  fulfill the customer's order.
         var newInventory = parseInt(res[0].stock_quantity) - parseInt(answer.inventory);
         connection.query("UPDATE products SET stock_quantity = ? WHERE ?", [newInventory,{item_id:answer.item}],
                    function(error) {
                     if (error) throw err;
                      console.log("inventory updated");
                      start();
        });
        //  customerOrder();

       }else{
        // If not, the app should log a phrase like Insufficient quantity!, and then prevent the order from going through.
         console.log("Sorry- we do not have " + answer.inventory +  "  units in stock, please make a different selection");
         //have the user re-select by running the purchase function again
         start();
       }
      //  }
     })

  })

}

start();