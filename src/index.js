import axios from 'axios';
import PouchDB from 'PouchDB-browser';
import pouchfind from 'pouchdb-find';

PouchDB.plugin(pouchfind);

let apicountries = {
	create(){
		this.initElements();
		this.initCountry();
	},
	initElements(){

		const _this = this;

		let el_wrapper = document.createElement('div');
			el_wrapper.setAttribute('id','countries-template-wrapper');
			el_wrapper.style.display = 'none';

		document.querySelector('body').appendChild(el_wrapper);

		document.querySelectorAll('.countryapi-wrapper').forEach(function(el,i){

			let newel, newel_id;
			
			// -- render templates
			if( !el.querySelector('.countryapi .template') ){
				console.log('Country element countries wrapper '+i+' template is not define');
			}else{				

				newel = document.createElement('div');
				newel.innerHTML = el.querySelector('.countryapi .template').innerHTML.replace(/id/g,'data-id').replace(/class/g,'data-class');
				newel_id = 'countryapi-'+_this.makeid(5);
				newel.setAttribute('id',newel_id);

				el.querySelector('.countryapi').setAttribute('data-template-id','#'+newel_id);

				document.querySelector('#countries-template-wrapper').appendChild( newel );

				el.querySelector('.countryapi .template').remove();

				el.querySelector('.countryapi').innerHTML = ( document.querySelector( el.querySelector('.countryapi').getAttribute('data-template-id') ).innerHTML ).replace(/data-id/g,'id').replace(/data-class/g,'class').replace('{options}','').replace(/data-id/g,'id').replace(/data-class/g,'class');


				el.querySelector('.countryapi select').addEventListener('change',function(){

					let _this = this;

					let db = new PouchDB('countriesdb');

					if( this.value != '' ){

						if( this.closest('.countryapi-wrapper').querySelector('.stateapi') ){
							this.closest('.countryapi-wrapper').querySelector('.stateapi select').disabled = true;
							this.disabled = true;
							this.closest('.countryapi-wrapper').querySelector('.stateapi .countryapi-loader').style.display = 'flex';
						}

						db.find({
						  selector: {country_id: {$eq: parseInt(this.value) }},
						  fields : ['states']
						}).then(function (results) {

							let options = '';

							// if nigeria or results from rethinkdb states count is 0
							if( _this.querySelector('option[value="'+_this.value+'"]').textContent.trim().toLowerCase() === 'nigeria' && window.countries_config.ms != 'global' ){
								axios.get('https://cnapi.connectnigeria.com/api/v3/events/get-states?country='+_this.value+'&ms='+window.countries_config.ms+'&country_name='+ _this.querySelector('option[value="'+_this.value+'"]').textContent.trim().toLowerCase())
	                            .then(function(res){
	                                if( res.data.success ){

	                                	let data = res.data.msg.sort(function(a, b){
							                if(a.name < b.name) { return -1; }
							                if(a.name > b.name) { return 1; }
							                return 0;
							            });

							            data.forEach(function(v){
									 		options+='<option value="'+v.state_id+'">'+v.name+'</option>';
									 	});
									 		
									 	if( _this.closest('.countryapi-wrapper').querySelector('.stateapi') ){

									 		_this.disabled = false;
											_this.closest('.countryapi-wrapper').querySelector('.stateapi select').disabled = false;

									 		let els = document.querySelector( _this.closest('.countryapi-wrapper').querySelector('.stateapi').getAttribute( 'data-template-id' ) );
											let elsnew = els.querySelector('select').innerHTML;
											_this.closest('.countryapi-wrapper').querySelector('.stateapi select').innerHTML = elsnew.replace(/data-id/g,'id').replace(/data-class/g,'class').replace('{options}',options);

											if( _this.closest('.countryapi-wrapper').querySelector('.stateapi').getAttribute('data-default') && _this.closest('.countryapi-wrapper').querySelector('.stateapi').getAttribute('data-default') != '' ){
												 _this.closest('.countryapi-wrapper').querySelector('.stateapi select').disabled = false;
												 _this.closest('.countryapi-wrapper').querySelector('.stateapi select').value = _this.closest('.countryapi-wrapper').querySelector('.stateapi').getAttribute('data-default');
												 _this.closest('.countryapi-wrapper').querySelector('.stateapi select').querySelectorAll('option').forEach(function(op){
												 	let notnumber = ( isNaN(_this.closest('.countryapi-wrapper').querySelector('.stateapi').getAttribute('data-default')) ) ? op.textContent.trim() : op.getAttribute('value');

												 	if( notnumber ===  _this.closest('.countryapi-wrapper').querySelector('.stateapi').getAttribute('data-default') ){
												 		op.selected = true;
												 	}else{
									 					op.selected = false;
												 	}
												 });

												if( _this.closest('.countryapi-wrapper').querySelector('.stateapi select').selectedIndex == -1 ){
													_this.closest('.countryapi-wrapper').querySelector('.stateapi select').value = '';
												}

												var event = new Event('change');
												_this.closest('.countryapi-wrapper').querySelector('.stateapi select').dispatchEvent(event);

											}

											_this.setAttribute('data-default','');

									 		_this.closest('.countryapi-wrapper').querySelector('.stateapi .countryapi-loader').style.display = 'none';
									 	}

									 	// if nigeria
									 	if( _this.querySelector('option[value="'+_this.value+'"]').textContent.trim().toLowerCase() === 'nigeria'){
									 		return;
									 	}
									 	// -- end if nigeria

	                                    // update countries with their states
	                                    let db = new PouchDB('countriesdb');

	                                    db.find({
	                                    	selector: {country_id: {$eq: parseInt(_this.value) }},
											fields : ['_id']
	                                    }).then(function(results){

	                                    	db.get(results.docs[0]._id).then(function(doc){
	                                    		return db.put({
		                                            _id : doc._id,
		                                            _rev : doc._rev,
		                                            states : res.data.msg
		                                        }).catch(function(err){
		                                        	console.log('Error updating country '+_this.val()+' states');
		                                        	console.log(err);
		                                        });
	                                    	}).catch(function(err){
	                                    		console.log('Error when retreiving country '+_this.textContent+' by its ID');
	                                    		console.log(err);
	                                    	})

	                                    }).catch(function(err){
	                                    	console.log('Error when retreiving country '+_this.textContent);
	                                    	console.log(err);
	                                    });
	                                }

	                            }).catch(function( err ) {
	                                console.log('Error getting raw states');
	                                console.log(err);
	                            });


								return;
							}

							let data = results.docs[0].states.sort(function(a, b){
				                if(a.name < b.name) { return -1; }
				                if(a.name > b.name) { return 1; }
				                return 0;
				            });

							data.forEach(function(v){
								options+='<option value="'+v.state_id+'">'+v.name+'</option>';
							});
						 		
						 	if( _this.closest('.countryapi-wrapper').querySelector('.stateapi') ){

						 		let els = document.querySelector( _this.closest('.countryapi-wrapper').querySelector('.stateapi').getAttribute( 'data-template-id' ) );
								let elsnew = els.querySelector('select').innerHTML;
								_this.closest('.countryapi-wrapper').querySelector('.stateapi select').innerHTML = elsnew.replace(/data-id/g,'id').replace(/data-class/g,'class').replace('{options}',options);

								_this.disabled = false;
								_this.closest('.countryapi-wrapper').querySelector('.stateapi select').disabled = false;

								if( _this.closest('.countryapi-wrapper').querySelector('.stateapi').getAttribute('data-default') && _this.closest('.countryapi-wrapper').querySelector('.stateapi').getAttribute('data-default') != '' ){
									_this.closest('.countryapi-wrapper').querySelector('.stateapi select').value =  _this.closest('.countryapi-wrapper').querySelector('.stateapi').getAttribute('data-default');
									_this.closest('.countryapi-wrapper').querySelector('.stateapi select').disabled = false;
									_this.closest('.countryapi-wrapper').querySelector('.stateapi select').querySelectorAll('option').forEach(function(op){
										let notnumber = ( isNaN(_this.closest('.countryapi-wrapper').querySelector('.stateapi').getAttribute('data-default')) ) ? op.textContent.trim() : op.getAttribute('value');
										if( notnumber === _this.closest('.countryapi-wrapper').querySelector('.stateapi').getAttribute('data-default') ){
											op.selected = true;
										}else{
					 						op.selected = false;
										}
									});
									if( _this.closest('.countryapi-wrapper').querySelector('.stateapi select').selectedIndex == -1 ){
										_this.closest('.countryapi-wrapper').querySelector('.stateapi select').value = ''
									}

									var event = new Event('change');
									_this.closest('.countryapi-wrapper').querySelector('.stateapi select').dispatchEvent(event);
								}

								_this.setAttribute('data-default','');

						 		_this.closest('.countryapi-wrapper').querySelector('.stateapi .countryapi-loader').style.display = 'none';
						 	}

						}).catch(function (err) {
							console.log('Error getting states');
							console.log(err);

							let els = document.querySelector( _this.closest('.countryapi-wrapper').querySelector('.stateapi').getAttribute( 'data-template-id' ) );
							let elsnew = els.querySelector('select').innerHTML;
							_this.closest('.countryapi-wrapper').querySelector('.stateapi select').innerHTML = elsnew.replace(/data-id/g,'id').replace(/data-class/g,'class').replace('{options}','');

							_this.setAttribute('data-default','');

							_this.disabled = false;
							_this.closest('.countryapi-wrapper').querySelector('.stateapi select').disabled = false;
					 		_this.closest('.countryapi-wrapper').querySelector('.stateapi .countryapi-loader').style.display = 'none';

						});
					}else{

						this.setAttribute('data-default','');

						if( this.closest('.countryapi-wrapper').querySelector('.stateapi') ){
							this.closest('.countryapi-wrapper').querySelector('.stateapi select').value = '';
							this.closest('.countryapi-wrapper').querySelector('.stateapi').disabled = true;

							// disabled state when country is empty
						}

						if( this.closest('.countryapi-wrapper').querySelector('.cityapi') ){
							this.closest('.countryapi-wrapper').querySelector('.cityapi select').value = '';
							this.closest('.countryapi-wrapper').querySelector('.cityapi select').disabled = true;
						}

					}
				});
			}

			if( !el.querySelector('.stateapi .template') ){
				console.log('State element countries wrapper '+i+' template is not define');
			}else{

				newel = document.createElement('div');
				newel.innerHTML = el.querySelector('.stateapi .template').innerHTML.replace(/id/g,'data-id').replace(/class/g,'data-class');
				newel_id = 'stateapi-'+_this.makeid(5);
				newel.setAttribute('id',newel_id);
				el.querySelector('.stateapi').setAttribute('data-template-id','#'+newel_id);

				document.querySelector('#countries-template-wrapper').appendChild( newel );

				el.querySelector('.stateapi .template').remove();

				el.querySelector('.stateapi').innerHTML = ( document.querySelector( el.querySelector('.stateapi').getAttribute( 'data-template-id' ) ).innerHTML ).replace(/data-id/g,'id').replace(/data-class/g,'class').replace('{options}','').replace(/data-id/g,'id').replace(/data-class/g,'class');			

				el.querySelector('.stateapi select').addEventListener('change',function(){
					const _this = this;

					this.disabled = false;
					this.closest('.countryapi-wrapper').querySelector('.cityapi select').disabled = true;
			 		this.closest('.countryapi-wrapper').querySelector('.cityapi .countryapi-loader').style.display = 'flex';

					let req = '?country='+this.closest('.countryapi-wrapper').querySelector('.countryapi select').value;
					if( this.value != '' ){
						req = '?country='+this.closest('.countryapi-wrapper').querySelector('.countryapi select').value+'&state='+this.value;
					}else{
						if( this.closest('.countryapi-wrapper').querySelector('.cityapi') ){
							this.closest('.countryapi-wrapper').querySelector('.cityapi select').value = '';
							this.closest('.countryapi-wrapper').querySelector('.cityapi select').disabled = true;
						}
					}

					axios.get('https://cnapi.connectnigeria.com/api/v3/events/get-cities'+req+'&ms='+window.countries_config.ms).then(function(res){
						if( res.data.success){
							let options = '';

							let data = res.data.msg.sort(function(a, b){
				                if(a.cityapi < b.city) { return -1; }
				                if(a.cityapi > b.city) { return 1; }
				                return 0;
				            });

				            data.forEach(function(v){
								options+='<option value="'+v.id+'">'+v.city+'</option>';
							});
						 		
						 	if( _this.closest('.countryapi-wrapper').querySelector('.cityapi') ){


						 		let els = document.querySelector( _this.closest('.countryapi-wrapper').querySelector('.cityapi').getAttribute( 'data-template-id' ) );
								let elsnew = els.querySelector('select').innerHTML;
								_this.closest('.countryapi-wrapper').querySelector('.cityapi select').innerHTML = elsnew.replace(/data-id/g,'id').replace(/data-class/g,'class').replace('{options}',options);

								if( _this.closest('.countryapi-wrapper').querySelector('.cityapi').getAttribute('data-default') && _this.closest('.countryapi-wrapper').querySelector('.cityapi').getAttribute('data-default') != '' ){
									_this.closest('.countryapi-wrapper').querySelector('.cityapi').querySelector('select').value = _this.closest('.countryapi-wrapper').querySelector('.cityapi').getAttribute('data-default');
									_this.closest('.countryapi-wrapper').querySelector('.cityapi').querySelector('select').disabled = false;
						 			_this.closest('.countryapi-wrapper').querySelector('.cityapi').querySelector('select').querySelectorAll('option').forEach(function(op){
						 				let notnumber = ( isNaN(_this.closest('.countryapi-wrapper').querySelector('.cityapi').getAttribute('data-default')) ) ? op.textContent.trim() : op.getAttribute('value');
						 				if( notnumber === _this.closest('.countryapi-wrapper').querySelector('.cityapi').getAttribute('data-default') ){
						 					op.selected = true;
						 				}else{
						 					op.selected = false;
						 				}
						 			});

						 			if( _this.closest('.countryapi-wrapper').querySelector('.cityapi select').selectedIndex == -1 ){
										_this.closest('.countryapi-wrapper').querySelector('.cityapi select').value = ''
									}
						 		}

						 		_this.setAttribute('data-default','');

								_this.disabled = false;
								_this.closest('.countryapi-wrapper').querySelector('.cityapi select').disabled = false;
						 		_this.closest('.countryapi-wrapper').querySelector('.cityapi .countryapi-loader').style.display = 'none';
						 	}

						 	_this.closest('.countryapi-wrapper').querySelector('.cityapi').setAttribute('data-default','');

						}

						_this.disabled = false;
						_this.closest('.countryapi-wrapper').querySelector('.cityapi select').disabled = false;
				 		_this.closest('.countryapi-wrapper').querySelector('.cityapi .countryapi-loader').style.display = 'none';

					}).catch(function(err){
						console.log('Error getting cities for state'+_this.textContent);
						console.log(err);

						_this.setAttribute('data-default','');

						let els = document.querySelector( _this.closest('.countryapi-wrapper').querySelector('.cityapi').getAttribute( 'data-template-id' ) );
						let elsnew = els.querySelector('select').innerHTML;
						_this.closest('.countryapi-wrapper').querySelector('.cityapi select').innerHTML = elsnew.replace(/data-id/g,'id').replace(/data-class/g,'class').replace('{options}','');

						_this.disabled = false;
						_this.closest('.countryapi-wrapper').querySelector('.cityapi select').disabled = false;
				 		_this.closest('.countryapi-wrapper').querySelector('.cityapi .countryapi-loader').style.display = 'none';
					});
				});
			}

			if( !el.querySelector('.cityapi .template') ){
				console.log('City element countries wrapper '+i+' template is not define');
			}else{
				

				newel = document.createElement('div');
				newel.innerHTML = el.querySelector('.cityapi .template').innerHTML.replace(/id/g,'data-id').replace(/class/g,'data-class');
				newel_id = 'cityapi-'+_this.makeid(5);
				newel.setAttribute('id',newel_id);
				el.querySelector('.cityapi').setAttribute('data-template-id','#'+newel_id);

				document.querySelector('#countries-template-wrapper').appendChild( newel );

				el.querySelector('.cityapi .template').remove();

				el.querySelector('.cityapi').innerHTML = ( document.querySelector( el.querySelector('.cityapi').getAttribute( 'data-template-id' ) ).innerHTML ).replace(/data-id/g,'id').replace(/data-class/g,'class').replace('{options}','').replace(/data-id/g,'id').replace(/data-class/g,'class');

				el.querySelector('.cityapi select').addEventListener('change',function(){
					this.setAttribute('data-default','');
				});
			}

			if( el.querySelector('.stateapi').querySelector('select') ) {
				el.querySelector('.stateapi').querySelector('select').disabled = true;
			}

			if( el.querySelector('.cityapi').querySelector('select') ) {
				el.querySelector('.cityapi').querySelector('select').disabled = true;
			}
			// --

			// -- add loaders
			let loader = document.createElement('div');
				loader.classList.add('countryapi-loader');
				loader.textContent = 'Loading countries';
			el.querySelector('.countryapi').appendChild(loader);
			// -- continue, unable to add loader ot country


			loader = document.createElement('div');
				loader.classList.add('countryapi-loader');
				loader.textContent = 'Loading states';
			el.querySelector('.stateapi').appendChild(loader);

			loader = document.createElement('div');
				loader.classList.add('countryapi-loader');
				loader.textContent = 'Loading cities';
			el.querySelector('.cityapi').appendChild(loader);
			// --

		});
		
	},
	renderCountries(e,exist=false){

		const _this = this;

		document.querySelectorAll('.countryapi').forEach( function(el) {
			el.querySelector('.countryapi-loader').style.display = 'flex';
		});

		let options = '';

		let arr = [];


		if( exist ){
			e.forEach(function(v){
				arr.push(v.doc);
			});
		}else{
			e.forEach(function(v){
				arr.push(v);
			});
		}

		let data = arr.sort(function(a, b){
            if(a.name < b.name) { return -1; }
            if(a.name > b.name) { return 1; }
            return 0;
        });

		data.forEach(function(v,i){
			options+='<option value="'+v.country_id+'">'+v.name+'</option>';
		});
		

		document.querySelectorAll('.countryapi').forEach( function(el) {

			if( el.getAttribute('data-default') && el.getAttribute('data-default') != '' ){
				let dval = ( isNaN(el.getAttribute('data-default')) ) ? data.find( i => i.name == el.getAttribute('data-default') ) : data.find( i => i.country_id == parseInt( el.getAttribute('data-default') ) ) ;
				
				if( dval && el.classList.contains('hide-others') ){
					options ='<option value="'+dval.country_id+'">'+dval.name+'</option>';
				}
			}

			if( !el.getAttribute( 'data-template-id') ){
				console.log('Country element '+i+' template is not define');
				return;
			}

			let els = document.querySelector( el.getAttribute( 'data-template-id' ) );
			let elsnew = els.querySelector('select').innerHTML;
			el.querySelector('select').innerHTML = elsnew.replace(/data-id/g,'id').replace(/data-class/g,'class').replace('{options}',options);

			if( el.getAttribute('data-default') && el.getAttribute('data-default') != '' ){
				el.querySelector('select').value = el.getAttribute('data-default');
				el.querySelector('select').disabled = false;
				el.querySelector('select').querySelectorAll('option').forEach(function(op){
					let notnumber = ( isNaN(el.getAttribute('data-default')) ) ? op.textContent.trim() : op.getAttribute('value');
					if(notnumber ===  el.getAttribute('data-default') ){
						op.selected = true;
					}else{
 						op.selected = false;
					}
				});

				if( el.querySelector('select').selectedIndex == -1 ){
					el.querySelector('select').value = '';
				}

				var event = new Event('change');
				el.querySelector('select').dispatchEvent(event);
			}

			el.querySelector('.countryapi-loader').style.display = 'none';
		});
	},
	downloadCountries(){
		const _this = this;

		axios.get('https://cnapi.connectnigeria.com/api/v3/events/get-countries').then((res)=>{
            if( res.data.success ){

            	let db = new PouchDB('countriesdb');

            	let data = res.data.msg.sort(function(a, b){
	                if(a.name < b.name) { return -1; }
	                if(a.name > b.name) { return 1; }
	                return 0;
	            });
                
                data.forEach( (v) => {
                	 db.put({
                        _id : v.country_id.toString(),
                        country_id : v.country_id,
                        name : v.name,
                        continent_code : v.continent_code,
                        continent : v.continent,
                        states : v.states
                    }).catch(function(err){
                        console.log(err);
                    });
                });

                _this.renderCountries(data,false);
            }
        }).catch( (err) => {
            console.log('Unable to connect to countries api via countries fallback');
            console.log(err);

        });
	},
	initCountry(){
		let db = new PouchDB('countriesdb');

		db.destroy().then(()=>{
			this.downloadCountries();
		});
	},
	makeid(length){
		let result           = '';
		let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let charactersLength = characters.length;
	   for ( var i = 0; i < length; i++ ) {
	      result += characters.charAt(Math.floor(Math.random() * charactersLength));
	   }
	   return result;
	}
}

apicountries.create();