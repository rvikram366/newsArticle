(function(){
	
	window.App ={
		
		Models:{},
		Views:{},
		Collections:{},
		Routers:{}
		
	};
	
	var searchValue;
	var modelFlag = false;
	
	//Model
	App.Models.NewsModel = Backbone.Model.extend({
		
		defaults:{
			
			title:"",
			shortDescription :"",
			fullDescription :"",
			authorName:"",
			date:"",
			isActive:true
		}
	});
	
	//Views
	
	App.Views.NewsView = Backbone.View.extend({
		tagname : 'li',
		template : _.template($('#newsListItemTemplate').html()),
		
		initialize: function() {
			//this.model.on('change',this.render,this);
			//this.model.on('destroy',this.remove,this);
		},
		
		events : {
			'click .title' :'showDescription',
			'click .editArticlebtn' :'edit',
			'click .delArticlebtn'	: 'deleteModel'
		},
		
		deleteModel : function(){
			this.undelegateEvents();
			this.$el.removeData().unbind(); 

			this.remove();  
			Backbone.View.prototype.remove.call(this);
			//this.model.destroy();			
		},
		
		showDescription : function(){
			
			globalModel = this.model;
			appRouter.navigate('desc',{trigger: true});
		},		
		
		edit : function(){
			globalModel = this.model;
			modelFlag = true;
			appRouter.navigate('add',{trigger: true});
			
			/* var editView = new App.Views.AddNewsView({
				 el : $('#newsList'),
				model: this.model
			});
			editView.render(); */
		
		},
		
		render : function(){
			this.$el.html(this.template( this.model.toJSON() ));
			return this;
		}	
	});
	
	App.Views.NewsListView = Backbone.View.extend({
		
		tagname : 'ui',

		initialize: function() {
			//this.collection.on('change',this.render,this);
			//this.collection.on('add',this.render,this);
		},		
		
		render : function(){
			
			this.$el.empty();
			
			this.collection.each(function(newsModel){
				
				if(searchValue){
					var title = newsModel.get('title');
					
					if(searchValue.toUpperCase() == title.toUpperCase()){
						
						var newsView = new App.Views.NewsView({
							model : newsModel
						});
				
						this.$el.append(newsView.render().el);
					}
				}else{
					
					var newsView = new App.Views.NewsView({
						model : newsModel
					});
				
					this.$el.append(newsView.render().el);
					
				}
				
				
			},this);
			return this;
		}		
		
	});
	
	App.Views.DescriptionView = Backbone.View.extend({
		
		template : _.template($('#newsDescriptonTemplate').html()),
		
		events : {			
			'click .editArticlebtn' :'edit'
		},
		
		edit : function(){
			appRouter.navigate('add',{trigger: true});		
		},
		deleteModel : function(){	
			
			var model = this.collection.get(globalModel.cid);
			model.destroy();
			appRouter.navigate('home',{trigger: true});	
		},
		
		render : function(){
			
			this.$el.html(this.template( globalModel.toJSON() ));			
			return this;
		}
		
	});
	
	App.Views.HomePageView = Backbone.View.extend({
		
		template : _.template($('#homeItemTemplate').html()),
		
		events : {
			'click .addbtn' : 'addArticleLanding',
			'click .srchbtn' : 'filterList'
		},
		
		filterList : function(){
			searchValue = $(".srchVal").val();
			newsListView.render();
		},
		addArticleLanding : function(){
			appRouter.navigate('add',{trigger: true});			
		},		
		
		render : function(){
			this.$el.html(this.template());
			return this;
		}
		
	});
	
	App.Views.AddNewsView = Backbone.View.extend({
		
		template : _.template($('#createArticleTemplate').html()),
		
		initialize:function(){
			
			$( "#newsList" ).on( "focus",  "#datepicker", function() {
				if(!$( "#datepicker" ).hasClass('hasDatepicker')){
					$( "#datepicker" ).datepicker();
				}
			});
		},
		
		events : {
			'click .addArticlebtn' : 'addArticle',
			'click .updateArticlebtn' : 'updateArticle',
		},
		
		addArticle : function(e){
			e.preventDefault();
			
			var status = $(".myStatus").val() == "true" ? true : false;
			
			var newArticle = new App.Models.NewsModel({
				title:$(".title").val(),
				shortDescription :$(".shrtDesc").val(),
				fullDescription :$(".fullDesc").val(),
				authorName:$(".Name").val(),
				date:$(".date").val(),
				isActive:status				
			});
		
			this.collection.add(newArticle);
			appRouter.navigate('home',{trigger: true});			
		},
		
		updateArticle : function(){
			
			var status = $(".myStatus").val() == "true" ? true : false;			
			var cid = globalModel.cid;
			
			var model = this.collection.get(cid);
			model.set({title:$(".title").val(),
				shortDescription :$(".shrtDesc").val(),
				fullDescription :$(".fullDesc").val(),
				authorName:$(".Name").val(),
				date:$(".date").val(),
				isActive:status});
			appRouter.navigate('home',{trigger: true});				
		},	
		
		
		
		render : function(){
			//var cid = globalModel.cid;			
			//var model = this.collection.get(cid);
			
			if(globalModel){
					globalModel.set("add",false);
					this.$el.html(this.template(globalModel.toJSON()));
			}else{
				var localModel = new App.Models.NewsModel();
				localModel.set("add",true);
					this.$el.html(this.template(localModel.toJSON()));
			}
			
			return this;
		}
		
		
	});
	
	// Router
	App.Routers.ShowNewsRouter = Backbone.Router.extend({
      routes: {
        '' : 'index',
        'desc' : 'showDesc',
		'add':'addNewArticle',
		'home' : 'index'
		
      },
	  
	  index : function(){
		  newsListView.render();
		  homeItemsView.render();
	  },
	  showDesc : function(){
		
		showView.render();	  
	  },
	  
	  addNewArticle : function(){
		$('#homeItems').html("");
		addArticleView.render();
	  }
    });
    
	
	
	//Collections
	
	App.Collections.NewsCollection = Backbone.Collection.extend({
		model : App.Views.NewsView
	});
	
	
	
	
	$(document).ready(function(){
		
		
		globalModel = new App.Models.NewsModel();
		
		var newsModel1= new App.Models.NewsModel({
			title:"FIFA",
			shortDescription :"Argentina won the match",
			fullDescription :"Argentina won the match",
			authorName:"Vikky",
			date:"03/07/2018",
			isActive:true
			
		});
		
		var newsModel2= new App.Models.NewsModel({
			title:"FIFA",
			shortDescription :"Belgium lost the match",
			fullDescription :"Belgium lost the match",
			authorName:"SAI",
			date:"03/07/2018",
			isActive:true
			
		});
		
		var newsModel3= new App.Models.NewsModel({
			title:"FIFA",
			shortDescription :"Canada won the match",
			fullDescription :"Canada won the match",
			authorName:"Priya",
			date:"03/07/2018",
			isActive:true
			
		}); 	
			
		var modelsArray = [newsModel1,newsModel2,newsModel3];
		
		newsCollection = new App.Collections.NewsCollection();
		
		newsCollection.reset(modelsArray);
		
		newsListView = new App.Views.NewsListView({
			el : $('#newsList'),
			collection : newsCollection			
		});
		newsListView.render();
		
		homeItemsView = new App.Views.HomePageView({
			el : $('#homeItems')
		});
		homeItemsView.render();
		
		addArticleView = new App.Views.AddNewsView({
			  el : $('#newsList'),
			  collection : newsCollection			  
		});
		 
		showView =  new App.Views.DescriptionView({
			  el : $('#newsList'),
			  collection : newsCollection
		});
				
		appRouter = new App.Routers.ShowNewsRouter();
		Backbone.history.start();
		
		
		
	});
	
	
	
})();