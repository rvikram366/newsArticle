(function(){
	
	window.App ={
		
		Models:{},
		Views:{},
		Collections:{},
		Routers:{},
		ViewInstances: {}
	};
	
	
	
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
		
		template : _.template($('#newsListItemTemplate').html()),		
		
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
			debugger;
			var url ='desc/'+this.model.cid;
			appRouter.navigate(url,{trigger: true});
		},		
		
		edit : function(){		
			
			var url ='edit/'+this.model.cid;
			appRouter.navigate(url,{trigger: true});
			
		},
		
		render : function(){
			this.$el.html(this.template( this.model.toJSON() ));
			return this;
		}	
	});
	
	App.Views.NewsListView = Backbone.View.extend({
		
		filter : function(){
			
			var mycollection = this.collection.filter(function(model){					
						//debugger;
						var title = model.get('title');
						if(_.isString(title)){
							return searchValue.toUpperCase() === title.toUpperCase(); 
						}					
						
						}, this);
			
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
		
		initialize : function(options){
			console.log('inside desc view: ', options);
			this.article_id = options.article_id;
		},
		
		events : {			
			'click .editArticlebtn' :'edit',
			'click .delArticlebtn'	: 'deleteModel'
		},
		
		edit : function(){			
		
			 var url ='edit/'+this.article_id;
			appRouter.navigate(url,{trigger: true}); 
			
			//appRouter.navigate('add',{trigger: true});		
		},
		deleteModel : function(){	
			
			// var model = this.collection.get(globalModel.cid);
			this.model.destroy();
			appRouter.navigate('home',{trigger: true});	
		},
		
		showDesc : function(){
			this.model = this.collection.get(this.article_id);
			this.render();
			
		},
		render : function(){
			
			this.$el.html(this.template( this.model.toJSON() ));			
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
			
			var newsListView = new App.Views.NewsListView({
				el : $('#newsList'),
				collection : newsCollection			
			});
			
			newsListView.render();
		
			searchValue = $(".srchVal").val();
			newsListView.filter();
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
		
		initialize:function(options){
			this.article_id = options.article_id;
			
			$( "#newsList" ).on( "focus",  "#datepicker", function() {
				if(!$( "#datepicker" ).hasClass('hasDatepicker')){
					$( "#datepicker" ).datepicker();
				}
			});
			
			this.templateData = {
				add: true,
				title: '',
				shortDescription: '',
				fullDescription: '',
				authorName: '',
				'status': 'true'
			};
			if(this.article_id) {
				var data = this.collection.get(this.article_id);
				_.extend(this.templateData, data.toJSON(), {add: false});
			}
			this.render();
		},
		
		events : {
			'click .addArticlebtn' : 'addArticle',
			'click .updateArticlebtn' : 'updateArticle',
		},
		
		addArticle : function(e){
			e.preventDefault();
			
			var status = $(".myStatus").val() === "true" ? true : false;
			
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
			
			var cid = this.article_id;
			
			var model = this.collection.get(cid);
			model.set({title:$(".title").val(),
				shortDescription :$(".shrtDesc").val(),
				fullDescription :$(".fullDesc").val(),
				authorName:$(".Name").val(),
				date:$(".date").val(),
				isActive:status});
			appRouter.navigate('home',{trigger: true});						
		},			
		
		render : function(model){
			
			this.$el.html(this.template({
				templateData: this.templateData
			}));
			return this;
		}
		
		
	});
	
	// Router
	App.Routers.ShowNewsRouter = Backbone.Router.extend({
      routes: {
        '' : 'index',
        'desc/:id' : 'showDesc',
		'edit/:id':'addNewArticle',
		'add':'addNewArticle',
		'home' : 'index'
		
      },
	  
	  index : function(){
		  //$('#newsList').html("");
		  //homeBindingView.render();
		  
		var newsListView = new App.Views.NewsListView({
			el : $('#newsList'),
			collection : newsCollection			
		});
		newsListView.render();
		
		var homeItemsView = new App.Views.HomePageView({
			el : $('#homeItems')
		});
		homeItemsView.render(); 
		
		
	  },
	  showDesc : function(id){
		
		//showView.showDesc(id);
			var showArticleView = new App.Views.DescriptionView({
			  el : $('#newsList'),
			  collection : newsCollection,
			  article_id : id
			});		
			
			showArticleView.showDesc();
		},
	  
	  addNewArticle : function(id){
		  
		$('#homeItems').html("");	

		var addView = new App.Views.AddNewsView({
			  el : $('#newsList'),
			  article_id : id,
			  collection : newsCollection			  
		});		
		// addView.show();
	  }
    });
    
	
	
	//Collections
	
	App.Collections.NewsCollection = Backbone.Collection.extend({
		model : App.Views.NewsView
	});
	
	
	
	
	$(document).ready(function(){
		
		
		//globalModel = new App.Models.NewsModel();
		
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
		
		var newsListView = new App.Views.NewsListView({
			el : $('#newsList'),
			collection : newsCollection			
		});
		newsListView.render();
		
		var homeItemsView = new App.Views.HomePageView({
			el : $('#homeItems')
		});
		homeItemsView.render(); 	
		
		/* newsListView = new App.Views.NewsListView({
			el : $('#news'),
			collection : newsCollection		
		});
		homeItemsView = new App.Views.HomePageView({
			el : $('#homeItems')
		}); */
		
		/* homeBindingView =  new App.Views.HomeBindingView({
			el : $('#newsList')
		});
		homeBindingView.render(); */
		
		/* addArticleView = new App.Views.AddNewsView({
			  el : $('#newsList'),
			  collection : newsCollection			  
		  }); */
		 
		/* showView =  new App.Views.DescriptionView({
			  el : $('#newsList'),
			  collection : newsCollection,
			  //model : globalModel
		  }); */
				
		appRouter = new App.Routers.ShowNewsRouter();
		
		/* App.ViewInstances.newsCollection = newsCollection;
		App.ViewInstances.homeItemsView = homeItemsView;
		App.ViewInstances.addArticleView = addArticleView;
		App.ViewInstances.showView = showView;
		App.ViewInstances.appRouter = appRouter; */
		
		
		// ,newsListView,homeItemsView,addArticleView,showView,appRouter};
		Backbone.history.start();		
		
	});
	
	
	
})();