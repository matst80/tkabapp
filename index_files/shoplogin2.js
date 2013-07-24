(function($) {
$.shopLogin2 = function(opt, t) {

    var opt = $.extend({ }, {
        
    }, opt || { }),
        il = opt.parent || $('<div id="ilogin" class="row cf" style="opacity:0" />'),
        lt, lastActive, fbauth,
        u = '/Core.WebShop,Core.WebShop.ShopCommon.asmx/';

    if (window.FB) {
        FB.Event.subscribe('auth.authResponseChange', function (response) {      
            if (response.status === 'connected') {
                fbauth = response.authResponse;
            }
        });
    }
/*
    if (window.FBid)
    {
        //loadFB();
        //QuickRegisterFb(string email, string password, string fname, string lname, bool newsletter,string fbid, string fbtoken, string address, string city, string zip)
    }*/

    $.loadMap('http://wd7.se/shop/'+(shopOpt.orfala?'loginorfala.htm':'login2.htm'), il, function(map) {
        if (window.customShopLogin)
            window.customShopLogin(il,map);
        if (opt.hideRegister) {
            il.find('.wd-register').hide();
            il.find('.wd-login2').removeClass('c6 ibr').addClass('c12');
        }
        function loadOrders() {
            
            var op = map.phOrders;

            function openOrder()
            {
                var id = $(this).data('id');
                $(this).parent().find('table:visible').hide();
                var rp = $(this).find('table').show().find('tbody');

                ar(u+'GetOrderRows',{id:id},function(d) {
                    rp.empty();
                    $.each(d,function() {
                        rp.append($('<tr><td>'+this.ArticleNr+'</td><td><a href="/__'+this.PageId+'">'+this.Title+'</a></td><td>'+(wdShop.showExVat ? this.PriceExcludingVat : this.Price)+'</td><td>'+this.Noi+'st</td></tr>'));
                    });
                    //rp.show();
                    il.trigger('resize');
                });                
                
                
            }

            ar(u+'GetOrders',{},function(d) {
                $.each(d,function() {
                    op.append($(dt('orderrow', '<li data-id="{0}">Datum:&nbsp;<span class="date">{1}</span>,&nbsp;ordernummer:&nbsp;<span class="id">{0}</span><table style="display:none"><thead><tr><th>Artikelnummer</th><th>Namn</th><th>Pris</th><th>Antal</th></tr></thead><tbody></tbody></table></li>').format(this.Id, this.Completed.format('yyyy-MM-dd'))).click(openOrder));
                });
            });

        }


        var cid = $.cookie('customerId');
        if (cid && cid.indexOf(':') != -1){
			cid = cid.split(':')[0];
			if(cid && cid > 0) {
				chg("iloggedin");
				loadOrders();
			}
        }

        map.dologout.click(function() {
            wdShop.logout();
        });

        if (!opt.parent)
            il.appendTo($('body')).ov({ width: 768, onclose: function(){
				il.remove();
				if(opt.onClose)
					opt.onClose();
			}});

        function sr(f, data, cb, err) {
            stat('', !!err ? 'rstatus' : 'lstatus');
            lastActive = il.find('.ph:visible').attr('id');
            lt = setTimeout(function() {
                chg('iloading');
            }, 100);
            ar(u + f, data, function(d) {
                if (window._gaq)
                    _gaq.push(['_trackEvent', 'Async ' + f, 'run']);
                clearTimeout(lt);
                chg(lastActive);
                cb(d);
            }, function(d,f) {
                clearTimeout(lt);
                chg(lastActive);

                if (err && typeof(err) == 'function')
                    err(d,f);
                else {
                    if (window._gaq)
                        _gaq.push(['_trackEvent', 'AsyncError ' + f, 'fail']);
                    stat(dt('erroroccured', 'Något gick fel, försök igen'), !!err ? 'rstatus' : 'lstatus');
                }
            });
        }

        function stat(txt, ctx, cb) {
            if (cb)
                cb(txt == '');
            if (txt == '') {
                map[ctx].slideUp();
                return;
            }
            map[ctx].slideDown().html(txt);
            chg();
        }
        function setCustomer(d) {
			if(d.cust)
				wdShop.currentCustomer = d.cust;
            $.cookie('customerId', null);
            $.cookie('customerId', d.id + ':' + d.secureKey + ':' + d.name, { expires: 365, path: '/' });
			$.cookie('exvat', (d.exvat) ? '1' : '0', { expires: 365, path: '/' });
			if(d.cust)
				$.shopLoginText(opt, t, d.cust);
            if (opt.onLogin)
                opt.onLogin(d);
			var ref = $('.asynchrefreshcust');
			if(!ref || !ref.length)
				ref = $('.asyncrefresh');
			setTimeout(function(){ ref.click(); }, 250);
			$(window).trigger('shoplogin',[d]);
			if(opt && opt.closeOnLogin)
				il.trigger('close');
        }

        function login() {
            sr('LoginCustomer', { username: $.trim(map.iusername.val()), password: $.trim(map.ipassword.val()) }, function(d) {
                if (d.isValid && d.id>0) {
                    setCustomer(d);
                    chg('iloggedin');
                }
                else {
                    stat(dt('loginfailed', 'Inloggningen misslyckades'), 'lstatus');

                }
            });
        }


        function checkRegister(cb) {
            
            var err = '';
            if (!shopOpt.orfala) {
                var p = $.trim(map.rpassword.val());
                if (p.length < 4)
                    err += dt('shortpass', 'Lösenordet måste vara minst 4 tecken<br/>');
            }
            var em = $.trim(map.remail.val());
            if (em.length > 4) {
                sr('CheckEmail', { email: em }, function(d) {
                    if (d) {
                        if (d == 1)
                            err += dt('duplicatemail', 'Epostadressen finns redan registrerad');
                        else if (d == -1)
                            err += dt('invalidemail', 'Epostadressen är inte giltig');
                        stat(err, 'rstatus', cb);
                    }
                    stat(err, 'rstatus', cb);
                }, true);
            } else {
                err += dt('invalidemail', 'Epostadressen verkar inte giltig');
                stat(err, 'rstatus', cb);
            }

        }

        var current_d = 'first';
        function chg(name) {
			var c = name || current_d;
			current_d = c;
            il.find('>.ph').hide();
            var w = map[c].show().data('width');
            il.trigger('resize', [w || 768]);
        }

        function register() {
            //console.log(fbauth);
            checkRegister(function(ok) {
                if (ok) {
                    var senddata = {
                        iscompany: map.rcompany.is(':checked'), email: map.remail.val().trim(), address: map.raddress.val().trim(), city: map.rcity.val().trim(), zip: map.rzip.val().trim(),password:'', fname: map.rfname.val(), lname: map.rlname.val(), newsletter: map.rnewsletter.is(':checked')
                    };
                    if (fbauth)
                    {
                        senddata.fbid = fbauth.userID;
                        senddata.fbtoken = fbauth.accessToken;
                    }
                    if (shopOpt.orfala || shopOpt.showFullRegForm) {
                        sr('QuickRegisterWithAdress', senddata, function(d) {
                            setCustomer(d);
                            chg('iregisterd');
                            if (opt.onRegister)
                                opt.onRegister(d);
                        }, 1);
                    }
                    else {
                        senddata.password = map.rpassword.val().trim();
                        sr(fbauth?'QuickRegisterFb':'QuickRegister', senddata, function(d) {
                            setCustomer(d);
                            chg('iregisterd');
                            if (opt.onRegister)
                                opt.onRegister(d);
                        }, 1);
                    }
                }
            });
        }
		
		function changepass(){
			var op = $.trim(map.opass.val());
            var p1 = $.trim(map.npass.val());
			var p2 = $.trim(map.nrpass.val());
			if(p1 != p2) {
				stat(dt('newpassnomatch', 'Dina lösenord matchade inte.'), 'chstatus');
				return;
			}
			
			if(p1.length < 4) {
				stat(dt('shortpass', 'Lösenordet måste vara minst 4 tecken'), 'chstatus');
				return;
			}
			
			sr('ChangePassword', { oldPassword: op, newPassword: p1 }, function(d) {
				if(d){		
					setCustomer(d);
					chg('ipasschanged');
				} else {
					stat(dt('oldpasswrong', 'Ditt nuvarande lösenord är fel.'), 'chstatus');
				}
			}, 1);
		}

        il.find('.button').click(function() {
            if (window._gaq)
                _gaq.push(['_trackEvent', $(this).text(), 'clicked']);
        });
        il.find('input').hint();

        function quickLogin(e) {
            if (e.keyCode==13)
                login();
        }
        map.iusername.keypress(quickLogin);
        map.ipassword.keypress(quickLogin);
		map.showchangepass.click(function(){ chg('ichangepassword'); });
		map.dochangepass.click(changepass);
        if (!shopOpt.orfala) {
            map.rpassword.change(checkRegister);
        }
        map.remail.change(checkRegister);
        map.dologin.click(login);
        map.dorecover.click(function() {
            map.lemail.val(map.iusername.val());
            chg('ilostpass');
        });
        map.dosendpass.click(function() {
            map.pstatus.slideUp();
            sr('ResetPassword', { user: map.lemail.val() }, function(ok) {
                if (ok)
                    chg('ipasswordsent');
                else
                    map.pstatus.slideDown();
            },function() {
                map.pstatus.slideDown();
            });
        });
        map.doregister.click(register);
        map.showregister.click(function() {
            $(this).hide();
			if(shopOpt.showFullRegForm){
				il.find('#fullrph').show();
				il.find('#prcchoosetyp').show();
				if((wdShop.lastOrder && wdShop.lastOrder.ic) || wdShop.showExVat()){
					map.rcompany.attr('checked', 'checked');
					map.rprivate.removeAttr('checked');
					toggleComp();
				}
			}
            il.find('#rph').slideDown(300, function() {
                il.trigger('resize');
            });
        });
		
		function toggleComp(){
			var s = map.rcompany.is(':checked');
			il.find('#lfname').toggle(!s);
			il.find('#lcompanyname').toggle(s);
			il.find('#llname').toggle(!s);
			il.find('#lcontactperson').toggle(s);
		}

        function dofbreg() {
            FB.api('/me/permissions', function(response){
              
              if (response && response.data && response.data.length){
                var permissions = response.data.shift();
                //console.log(response);
                if (!permissions.email) {
                  FB.login(dofbreg,{scope: 'email,user_about_me'});
                }
                else {
                    FB.api('/me', function(response){
                        //console.log(response);
                        var city = '';
                        if (response.location && response.location.name)
                        {
                            var city = response.location.name.split(',')[0];    
                        }
                        
                        var senddata = {
                            iscompany: false, email: response.email.trim(), address: '', city: city.trim(), zip: '',password:'', fname: response.first_name, lname: response.last_name, newsletter: true
                        };

                    if (fbauth)
                    {
                        senddata.fbid = fbauth.userID;
                        senddata.fbtoken = fbauth.accessToken;
                    }
                    sr('QuickRegisterFb', senddata, function(d) {
                            setCustomer(d);
                            chg('iregisterd');
                            if (opt.onRegister)
                                opt.onRegister(d);
                        }, function(e,err) {
                            stat(dt('fbregisterfail', 'Användaren kunde inte skapas från Facebook-kontot<br />Troligen finns epostadressen redan regisrerad'), 'fbstatus');
                        });
                    });
                }
              }
            });
        }

        map.fbregister.click(function() {
            
            if (!fbauth)
            {
                 FB.login(dofbreg, {scope: 'email,user_about_me'});
            }
            else
                dofbreg();
            
        });

        function dofblogin() {
            FB.getLoginStatus(function(response) {
                    if (response.status === 'connected') {
                        
                        fbauth = response.authResponse;
                        console.log(response);
                        sr('LoginFacebook',{fbid:fbauth.userID,fbtoken:fbauth.accessToken},function(d) {
                            if (d.isValid && d.id>0) {
                                setCustomer(d);
                                chg('iloggedin');
                            }
                            else {
                                stat(dt('loginfailed', 'Inloggningen misslyckades'), 'lstatus');

                            }
                        });


                    } 
                });
        }


        map.dologinfb.click(function() {
            if (!fbauth)
            {
                FB.login(dofblogin, {scope: 'email,user_about_me'});
            }
            else
                dofblogin();
        });
		map.rcompany.change(toggleComp);
		map.rprivate.change(toggleComp);
        if (window.FB)
        {
            
            il.find('.fblink').show();
            //FB.login();
        }

    },{nobutton:1});
};
$.shopLoginText = function(opt, t, d){
	if(d){
		t.html((opt.loggedInTextFormat||'Du är inloggad som {0}').format(d.Email));
		if (opt.loggedInLink)
		{
			t.unbind('click').attr('href',opt.loggedInLink);
		}
	}
	else
		t.html(opt.loggedOutText||'Logga in för att hämta uppgifter');
};

$.fn.shopLogin2 = function(opt) {
     var t =$(this);
	 function getCustomer(f){
		if(!wdShop.fetchedCustomer && !wdShop.fetchingCustomer)
		{
			wdShop.fetchingCustomer = true;
			shopcommon.GetCustomer(function(d) {
				wdShop.currentCustomer = d;
				wdShop.fetchedCustomer = true;
				if(f)
					f(d);
			});
		} else if(!wdShop.fetchedCustomer)
		{
			function tr(){
				if(wdShop.fetchedCustomer){
					if(f)
						f(wdShop.currentCustomer);
				} else setTimeout(tr, 100);
			}
			tr();
		} else if(f)
			f(wdShop.currentCustomer);
		
	 }
     function updateStatus() {
			getCustomer(function(d) {
				$.shopLoginText(opt, t, d);
			});
            t.unbind('click').bind('click',function() {
                $.shopLogin2(opt, t);
            });
    }
    updateStatus();
    if (opt.autoLogin)
        $.shopLogin2(opt, t);
}
})(jQuery);fd('shoplogin2.js');