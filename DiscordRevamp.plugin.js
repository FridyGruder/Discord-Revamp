/**
 * @name DiscordRevamp
 * @displayName DiscordRevamp
 * @authorId 333357946744602647
 * @website https://github.com/FridyGruder/Discord-Revamp
 * @source https://raw.githubusercontent.com/FridyGruder/Discord-Revamp/master/DiscordRevamp.plugin.js
 * @updateUrl https://raw.githubusercontent.com/FridyGruder/Discord-Revamp/master/DiscordRevamp.plugin.js
 */

var DiscordRevamp = (() => {
	const config = {
		info:{
			name: "Discord Revamp",
			authors: [{name: "Fridy", github_username: "FridyGruder", discord_id: "333357946744602647"}],
			description: "Revamps Discord and will add more features in the future.",
			version: "0.1.7",
			github: "https://github.com/FridyGruder/Discord-Revamp",
			github_raw: "https://raw.githubusercontent.com/FridyGruder/Discord-Revamp/master/DiscordRevamp.plugin.js"
		},
		defaultConfig: [
			{
				type: "dropdown",
				id: "borders",
				name: "Border",
				note: "Select which border you want to apply.",
				value: 0,
				options: [
					{ label: 'Rainbow', value: 0 },
					{ label: 'Shining', value: 1 },
					{ label: 'Pastel Rainbow', value: 2 },
					{ label: 'Look ->', value: 3},
					{ label: 'White Fire', value: 4},
					{ label: 'Blue Fire', value: 5},
					{ label: 'White Scribble', value: 6},
					{ label: 'Purple Scribble', value: 7},
					{ label: 'Rainbow Scribble', value: 8}
				]
			},
			{
				type: "switch",
				id: "self",
				name: "Self Border Only",
				note: "Choose if you want the borders to be applied to everyone or on yourself only.",
				value: false
			},
			{
				type: "switch",
				id: "glow",
				name: "Border Glow",
				note: "Choose if you want glow around your border to appear.",
				value: true
			},
			{
				type: "textbox",
				id: "color",
				name: "Glow Color",
				note: "Choose the color of your glowing effect. (Has to be a hex color. Don't forget to include '#'.)",
				value: "#FFFFFF"
			},
			{
				type: 'category',
				id: 'options',
				name: 'Border On Other Users.',
				collapsible: true,
				shown: true,
				settings: [
					{
						type: "switch",
						id: "other",
						name: "Apply Border On Specific Users",
						note: "Choose if you want the border to be applied on other specific users. (This is overridden by the self border setting.)",
						value: false
					},
					{
						type: "textbox",
						id: "ids",
						name: "User IDs",
						note: "Choose on who the border will be applied. (Only user IDs will work. Separate each ID with commas.)",
						value: ""
					}
				]
			}
		],
		changelog:[
			{
				"title": "Added",
				"type": "added",
				"items": ["Added settings to apply border on other specific users."]
			}
		]
	};
	
	var ownID;
	
	return !global.ZeresPluginLibrary ? class {
		constructor(){this._config = config;}
		getName(){return config.info.name;}
		getAuthor(){return config.info.authors.map(a => a.name).join(", ");}
		getDescription(){return config.info.description;}
		getVersion(){return config.info.version;}
		load(){
			BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
				confirmText: "Download",
				cancelText: "Cancel",
				onConfirm: () => {
					require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
						if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
						await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
					});
				}
			});
			BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
				confirmText: "Download",
				cancelText: "Cancel",
				onConfirm: () => {
					require("request").get("https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Library/0BDFDB.plugin.js", async (error, response, body) => {
						if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/mwittrien/BetterDiscordAddons/master/Library/0BDFDB.plugin.js");
						await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), body, r));
					});
				}
			});
		}
		start(){
			ownID = document.getElementsByClassName("avatar-VxgULZ")[0].src.split("/")[4];
		}
		stop(){}
	} : (([Plugin, Api]) => {
		const plugin = (Plugin, Api) => {
			const { WebpackModules, DiscordModules, Patcher, ReactComponents, PluginUtilities, Utilities } = Api;
			const { React, ChannelStore, UserStore, UserTypingStore, RelationshipStore, SelectedGuildStore, DiscordConstants, WindowInfo } = DiscordModules;
			const Flux = WebpackModules.getByProps("connectStores");
			const MutedStore = WebpackModules.getByProps("isMuted", "isChannelMuted");
			const Spinner = WebpackModules.getByDisplayName("Spinner");
			const Tooltip = WebpackModules.getByDisplayName("Tooltip");
			
			
			return class DiscordRevamp extends Plugin {
				
				observer(e) {
					
					var hex = "#FFFFFF"
					
					if(/^#[0-9A-F]{6}$/i.test(this.settings.color)){
						hex = this.settings.color;
					};
		
					ownID = document.getElementsByClassName("avatar-SmRMf2")[0].children[0].children[0].children[0].src.split("/")[4];
		
					var x = document.getElementsByClassName("groupStart-23k01U");
					for (var i = 0; i < x.length; i++) {
						var userID = x[i].getAttribute("user_by_bdfdb");
						var bord = x[i].getAttribute("border");
						var classes = x[i].classList;
						var children = x[i].children;
						var isSystemMessage = false;
						var isReply = false;
						var hasAtt = false;
						if(!bord ){
							for (var e = 0; e < children.length; e++) {
								var ChildClasses = children[e].classList;
								for (var o = 0; o < ChildClasses.length; o++) {
									if(ChildClasses[o] === "repliedMessage-VokQwo"){
										isReply = true;
										if(x[i].children[0].children[x[i].children[0].children.length - 1].classList[0] === "repliedTextContentIcon-1ivTae"){
											hasAtt = true;
										};
									};
								};
							};
							for (var e = 0; e < classes.length; e++) {
								if(classes[e] === "da-systemMessage"){
									isSystemMessage = true;
								}
							};
								if(!isSystemMessage && !isReply){
									var elem = document.createElement("img");
									if(this.settings.borders === 0){
										elem.src = 'https://cdn.discordapp.com/attachments/756385334039937076/811308000018956288/oie_16194654PRRcsREe.gif';
										elem.style.top = "1px";
										elem.style.left = "15px";
										elem.style.width = "42px";
										elem.style.height = "42px";
										if(this.settings.glow){
											elem.style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
										};
									}
									else if(this.settings.borders === 1){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811107528867053578/ezgif-4-03fe153459c3.gif';
										elem.style.top = "1px";
										elem.style.left = "15px";
										elem.style.width = "42px";
										elem.style.height = "42px";
										if(this.settings.glow){
											elem.style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
										};
									}
									else if(this.settings.borders === 2){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811101527699226644/ezgif-4-2bb847a7784d.gif';
										elem.style.top = "1px";
										elem.style.left = "15px";
										elem.style.width = "42px";
										elem.style.height = "42px";
										if(this.settings.glow){
											elem.style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
										};
									}
									else if(this.settings.borders === 3){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811413351937998848/giphy_7.gif';
										elem.style.top = "-4px";
										elem.style.left = "10px";
										elem.style.width = "52px";
										elem.style.height = "52px";
									}
									else if(this.settings.borders === 4){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811414329378471976/original.gif';
										elem.style.top = "-1px";
										elem.style.left = "13px";
										elem.style.width = "46px";
										elem.style.height = "46px";
										if(this.settings.self){
											if(this.settings.glow && userID === ownID){
												x[i].children[0].children[0].style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
											}
										}
										else{
											x[i].children[0].children[0].style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
										}
									}
									else if(this.settings.borders === 5){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811412156272214016/d26ab6e45a7d77b5f41704c31403d40c.gif';
										elem.style.top = "-1px";
										elem.style.left = "13px";
										elem.style.width = "46px";
										elem.style.height = "46px";
										if(this.settings.self){
											if(this.settings.glow && userID === ownID){
												x[i].children[0].children[0].style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
											}
										}
										else{
											x[i].children[0].children[0].style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
										}
									}
									else if(this.settings.borders === 6){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811412588754763806/giphy_1.gif';
										elem.style.top = "-6px";
										elem.style.left = "10px";
										elem.style.width = "52px";
										elem.style.height = "52px";
									}
									else if(this.settings.borders === 7){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811413217963147274/giphy_3.gif';
										elem.style.top = "-3px";
										elem.style.left = "12px";
										elem.style.width = "48px";
										elem.style.height = "48px";
									}
									else if(this.settings.borders === 8){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811413250927362098/giphy_4.gif';
										elem.style.top = "-2px";
										elem.style.left = "12px";
										elem.style.width = "48px";
										elem.style.height = "48px";
									}
									elem.setAttribute("class", "avatar-1BDn8e da-avatar");
									if(this.settings.self === true){
										if(userID === ownID){
											x[i].appendChild(elem);
										}
									}
									else if(this.settings.options.other){
										var ids = this.settings.options.ids.replace(/ /g, "").split(",");
										for (var t = 0; t < ids.length; t++){
											if(ids[t] === userID){
												x[i].appendChild(elem);
											}
										}
									}
									else{
										console.log("Border");
										x[i].appendChild(elem);
									}
									x[i].setAttribute("border", "true");
								}
								else if(!isSystemMessage){
									var elem = document.createElement("img");
									if(this.settings.borders === 0){
										elem.src = 'https://cdn.discordapp.com/attachments/756385334039937076/811308000018956288/oie_16194654PRRcsREe.gif';
										if(hasAtt){
											elem.style.top = "25px";
										}
										else{
											elem.style.top = "23px";
										}
										elem.style.left = "15px";
										elem.style.width = "42px";
										elem.style.height = "42px";
										if(this.settings.glow){
											elem.style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
										};
									}
									else if(this.settings.borders === 1){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811107528867053578/ezgif-4-03fe153459c3.gif';
										if(hasAtt){
											elem.style.top = "25px";
										}
										else{
											elem.style.top = "23px";
										}
										elem.style.left = "15px";
										elem.style.width = "42px";
										elem.style.height = "42px";
										if(this.settings.glow){
											elem.style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
										};
									}
									else if(this.settings.borders === 2){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811101527699226644/ezgif-4-2bb847a7784d.gif';
										if(hasAtt){
											elem.style.top = "25px";
										}
										else{
											elem.style.top = "23px";
										}
										elem.style.left = "15px";
										elem.style.width = "42px";
										elem.style.height = "42px";
										if(this.settings.glow){
											elem.style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
										};
									}
									else if(this.settings.borders === 3){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811413351937998848/giphy_7.gif';
										if(hasAtt){
											elem.style.top = "20px";
										}
										else{
											elem.style.top = "18px";
										}
										elem.style.left = "10px";
										elem.style.width = "52px";
										elem.style.height = "52px";
									}
									else if(this.settings.borders === 4){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811414329378471976/original.gif';
										if(hasAtt){
											elem.style.top = "24px";
										}
										else{
											elem.style.top = "22px";
										}
										elem.style.left = "13px";
										elem.style.width = "46px";
										elem.style.height = "46px";
										if(this.settings.self){
											if(this.settings.glow && userID === ownID){
												x[i].children[1].children[0].style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
											}
										}
										else{
											x[i].children[1].children[0].style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
										}
									}
									else if(this.settings.borders === 5){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811412156272214016/d26ab6e45a7d77b5f41704c31403d40c.gif';
										if(hasAtt){
											elem.style.top = "23px";
										}
										else{
											elem.style.top = "21px";
										}
										elem.style.left = "13px";
										elem.style.width = "46px";
										elem.style.height = "46px";
										if(this.settings.self){
											if(this.settings.glow && userID === ownID){
												x[i].children[1].children[0].style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
											}
										}
										else{
											x[i].children[1].children[0].style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
										}
									}
									else if(this.settings.borders === 6){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811412588754763806/giphy_1.gif';
										if(hasAtt){
											elem.style.top = "18px";
										}
										else{
											elem.style.top = "16px";
										}
										elem.style.left = "10px";
										elem.style.width = "52px";
										elem.style.height = "52px";
									}
									else if(this.settings.borders === 7){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811413217963147274/giphy_3.gif';
										if(hasAtt){
											elem.style.top = "22px";
										}
										else{
											elem.style.top = "20px";
										}
										elem.style.left = "12px";
										elem.style.width = "48px";
										elem.style.height = "48px";
									}
									else if(this.settings.borders === 8){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811413250927362098/giphy_4.gif';
										if(hasAtt){
											elem.style.top = "23px";
										}
										else{
											elem.style.top = "21px";
										}
										elem.style.left = "12px";
										elem.style.width = "48px";
										elem.style.height = "48px";
									}
									elem.setAttribute("class", "avatar-1BDn8e da-avatar");
									if(this.settings.self === true){
										if(userID === ownID){
											x[i].appendChild(elem);
										}
									}
									else if(this.settings.options.other){
										var ids = this.settings.options.ids.replace(/ /g, "").split(",");
										for (var t = 0; t < ids.length; t++){
											if(ids[t] === userID){
												x[i].appendChild(elem);
											}
										}
									}
									else{
										x[i].appendChild(elem);
									}
									x[i].setAttribute("border", "true");
								}
						};
					};
					
					var vc = document.getElementsByClassName("callAvatarMask-1SLlRi");
					var vcbord = document.getElementsByClassName("border-Jn5IOt");
					for (var i = 0; i < vcbord.length; i++) {
						var checked = vcbord[i].getAttribute("checked");
						if(!checked){
							vcbord[i].style.width = "40px";
							vcbord[i].style.height = "40px";
							vcbord[i].style.top = "20px";
							vcbord[i].style.left = "20px";
							vcbord[i].style.position = "absolute";
							vcbord[i].parentElement.parentElement.parentElement.parentElement.style.transform = "scale(2)";
							vcbord[i].parentElement.children[0].style.width = "40px";
							vcbord[i].parentElement.children[0].style.height = "40px";
							vcbord[i].parentElement.children[0].style.top = "20px";
							vcbord[i].parentElement.children[0].style.left = "20px";
							vcbord[i].parentElement.children[0].style.position = "absolute";
							vcbord[i].setAttribute("checked", "true");
						}
					}
					var vcbord3 = document.getElementsByClassName("status-1WEaea");
					for (var i = 0; i < vcbord3.length; i++) {
						var checked = vcbord3[i].getAttribute("checked");
						if(!checked){
							vcbord3[i].style.width = "10px";
							vcbord3[i].style.height = "10px";
							vcbord3[i].style.top = "50px";
							vcbord3[i].style.left = "50px";
							vcbord3[i].style.zIndex = "1";
							vcbord3[i].style.padding = "2";
							vcbord3[i].style.position = "absolute";
							vcbord3[i].parentElement.parentElement.parentElement.parentElement.style.transform = "scale(2)";
							vcbord3[i].parentElement.children[0].style.width = "40px";
							vcbord3[i].parentElement.children[0].style.height = "40px";
							vcbord3[i].parentElement.children[0].style.top = "20px";
							vcbord3[i].parentElement.children[0].style.left = "20px";
							vcbord3[i].parentElement.children[0].style.position = "absolute";
							vcbord3[i].setAttribute("checked", "true");
						}
					}
					for (var i = 0; i < vc.length; i++) {
						var userID = vc[i].children[0].children[0].getAttribute("src").split("/")[4];
						var bord = vc[i].getAttribute("border");
						if(!bord ){
									var elem = document.createElement("img");
									if(this.settings.borders === 0){
										elem.src = 'https://cdn.discordapp.com/attachments/756385334039937076/811308000018956288/oie_16194654PRRcsREe.gif';
										elem.style.position = "absolute";
										elem.style.top = "19px";
										elem.style.left = "19px";
										elem.style.width = "42px";
										elem.style.height = "42px";
										if(this.settings.glow){
											elem.style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
										};
									}
									else if(this.settings.borders === 1){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811107528867053578/ezgif-4-03fe153459c3.gif';
										elem.style.position = "absolute";
										elem.style.top = "19px";
										elem.style.left = "19px";
										elem.style.width = "42px";
										elem.style.height = "42px";
										if(this.settings.glow){
											elem.style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
										};
									}
									else if(this.settings.borders === 2){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811101527699226644/ezgif-4-2bb847a7784d.gif';
										elem.style.position = "absolute";
										elem.style.top = "19px";
										elem.style.left = "19px";
										elem.style.width = "42px";
										elem.style.height = "42px";
										if(this.settings.glow){
											elem.style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
										};
									}
									else if(this.settings.borders === 3){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811413351937998848/giphy_7.gif';
										elem.style.position = "absolute";
										elem.style.top = "14px";
										elem.style.left = "14px";
										elem.style.width = "52px";
										elem.style.height = "52px";
									}
									else if(this.settings.borders === 4){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811414329378471976/original.gif';
										elem.style.position = "absolute";
										elem.style.top = "17px";
										elem.style.left = "17px";
										elem.style.width = "46px";
										elem.style.height = "46px";
										if(this.settings.self){
											if(this.settings.glow && userID === ownID){
												vc[i].children[0].children[0].style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
											}
										}
										else{
											vc[i].children[0].children[0].style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
										}
									}
									else if(this.settings.borders === 5){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811412156272214016/d26ab6e45a7d77b5f41704c31403d40c.gif';
										elem.style.position = "absolute";
										elem.style.top = "17px";
										elem.style.left = "17px";
										elem.style.width = "46px";
										elem.style.height = "46px";
										if(this.settings.self){
											if(this.settings.glow && userID === ownID){
												vc[i].children[0].children[0].style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
											}
										}
										else{
											vc[i].children[0].children[0].style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
										}
									}
									else if(this.settings.borders === 6){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811412588754763806/giphy_1.gif';
										elem.style.position = "absolute";
										elem.style.top = "12px";
										elem.style.left = "14px";
										elem.style.width = "52px";
										elem.style.height = "52px";
									}
									else if(this.settings.borders === 7){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811413217963147274/giphy_3.gif';
										elem.style.position = "absolute";
										elem.style.top = "16px";
										elem.style.left = "16px";
										elem.style.width = "48px";
										elem.style.height = "48px";
									}
									else if(this.settings.borders === 8){
										elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811413250927362098/giphy_4.gif';
										elem.style.position = "absolute";
										elem.style.top = "17px";
										elem.style.left = "16px";
										elem.style.width = "48px";
										elem.style.height = "48px";
									}
									elem.setAttribute("class", "voiceAvatar-14IynY da-voiceAvatar");
									if(this.settings.self === true){
										if(userID === ownID){
											vc[i].children[0].appendChild(elem);
										}
									}
									else if(this.settings.options.other){
										var ids = this.settings.options.ids.replace(/ /g, "").split(",");
										for (var t = 0; t < ids.length; t++){
											if(ids[t] === userID){
												vc[i].children[0].appendChild(elem);
											}
										}
									}
									else{
										vc[i].children[0].appendChild(elem);
									}
									vc[i].setAttribute("border", "true");
						};
					};
					
					var vc2 = document.getElementsByClassName("mask-1l8v16");
					for (var i = 0; i < vc2.length; i++) {
						if(vc2[i].children[0].children[0]){
							if(vc2[i].children[0].children[0].getAttribute("src")){
								if(vc2[i].children[0].children[0].getAttribute("src").split("/")[4]){
									if(vc2[i].parentElement.classList[0] === "avatarWrapper-29j3CC"){
									var userID = vc2[i].children[0].children[0].getAttribute("src").split("/")[4];
						
									var bord = vc2[i].getAttribute("border");
									
									var vctile = vc2[i].children[0].children[0];
										var checked = vctile.getAttribute("checked");
										console.log("Pd.");
										if(!checked){
											console.log("Pd2.");
											vctile.parentElement.parentElement.parentElement.style.transform = "scale(2)";
											vctile.style.width = "40px";
											vctile.style.height = "40px";
											vctile.style.top = "20px";
											vctile.style.left = "20px";
											vctile.style.borderRadius = "50%";
											vctile.style.position = "absolute";
											vctile.setAttribute("checked", "true");
										}
									
									if(!bord ){
												var elem = document.createElement("img");
												if(this.settings.borders === 0){
													elem.src = 'https://cdn.discordapp.com/attachments/756385334039937076/811308000018956288/oie_16194654PRRcsREe.gif';
													elem.style.position = "absolute";
													elem.style.top = "19px";
													elem.style.left = "19px";
													elem.style.width = "42px";
													elem.style.height = "42px";
													if(this.settings.glow){
														elem.style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
													};
												}
												else if(this.settings.borders === 1){
													elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811107528867053578/ezgif-4-03fe153459c3.gif';
													elem.style.position = "absolute";
													elem.style.top = "19px";
													elem.style.left = "19px";
													elem.style.width = "42px";
													elem.style.height = "42px";
													if(this.settings.glow){
														elem.style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
													};
												}
												else if(this.settings.borders === 2){
													elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811101527699226644/ezgif-4-2bb847a7784d.gif';
													elem.style.position = "absolute";
													elem.style.top = "19px";
													elem.style.left = "19px";
													elem.style.width = "42px";
													elem.style.height = "42px";
													if(this.settings.glow){
														elem.style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
													};
												}
												else if(this.settings.borders === 3){
													elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811413351937998848/giphy_7.gif';
													elem.style.position = "absolute";
													elem.style.top = "14px";
													elem.style.left = "14px";
													elem.style.width = "52px";
													elem.style.height = "52px";
												}
												else if(this.settings.borders === 4){
													elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811414329378471976/original.gif';
													elem.style.position = "absolute";
													elem.style.top = "17px";
													elem.style.left = "17px";
													elem.style.width = "46px";
													elem.style.height = "46px";
													if(this.settings.self){
														if(this.settings.glow && userID === ownID){
															vc2[i].children[0].children[0].style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
														}
													}
													else{
														vc2[i].children[0].children[0].style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
													};
												}
												else if(this.settings.borders === 5){
													elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811412156272214016/d26ab6e45a7d77b5f41704c31403d40c.gif';
													elem.style.position = "absolute";
													elem.style.top = "17px";
													elem.style.left = "17px";
													elem.style.width = "46px";
													elem.style.height = "46px";
													if(this.settings.self){
														if(this.settings.glow && userID === ownID){
															vc2[i].children[0].children[0].style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
														}
													}
													else{
														vc2[i].children[0].children[0].style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
													};
												}
												else if(this.settings.borders === 6){
													elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811412588754763806/giphy_1.gif';
													elem.style.position = "absolute";
													elem.style.top = "12px";
													elem.style.left = "14px";
													elem.style.width = "52px";
													elem.style.height = "52px";
												}
												else if(this.settings.borders === 7){
													elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811413217963147274/giphy_3.gif';
													elem.style.position = "absolute";
													elem.style.top = "16px";
													elem.style.left = "16px";
													elem.style.width = "48px";
													elem.style.height = "48px";
												}
												else if(this.settings.borders === 8){
													elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811413250927362098/giphy_4.gif';
													elem.style.position = "absolute";
													elem.style.top = "17px";
													elem.style.left = "16px";
													elem.style.width = "48px";
													elem.style.height = "48px";
												}
												elem.setAttribute("class", "voiceAvatar-14IynY da-voiceAvatar");
												if(this.settings.self === true){
													if(userID === ownID){
														vc2[i].children[0].appendChild(elem);
													}
												}
												else if(this.settings.options.other){
													var ids = this.settings.options.ids.replace(/ /g, "").split(",");
													for (var t = 0; t < ids.length; t++){
														if(ids[t] === userID){
															vc2[i].children[0].appendChild(elem);
														}
													}
												}
												else{
													vc2[i].children[0].appendChild(elem);
												}
												vc2[i].setAttribute("border", "true");
									};
									}
								}
							}
						}
					};
					
					var st = document.getElementsByClassName("avatarUploaderInner-3UNxY3")[0];
					if(st){
						var bord = st.getAttribute("border");
						var children = st.children;
						var id = st.style.backgroundImage.split("/")[4];
						var elem = document.createElement("img");
						for (var i = 0; i < children.length; i++){
							var classlist = children[i].classList;
							for (var o = 0; o < classlist.length; o++){
								if(classlist[o] === "avatarUploaderIndicator-2G-aIZ"){
									children[i].style.zIndex = 1;
								}
							}
						}
						if(this.settings.borders === 0){
							elem.src = 'https://cdn.discordapp.com/attachments/756385334039937076/811308000018956288/oie_16194654PRRcsREe.gif';
							elem.style.top = "-2px";
							elem.style.left = "-2px";
							elem.style.width = "84px";
							elem.style.height = "84px";
							if(this.settings.glow){
								elem.style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
							};
						}
						else if(this.settings.borders === 1){
							elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811107528867053578/ezgif-4-03fe153459c3.gif';
							elem.style.top = "-2px";
							elem.style.left = "-2px";
							elem.style.width = "84px";
							elem.style.height = "84px";
							if(this.settings.glow){
								elem.style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
							};
						}
						else if(this.settings.borders === 2){
							elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811101527699226644/ezgif-4-2bb847a7784d.gif';
							elem.style.top = "-2px";
							elem.style.left = "-2px";
							elem.style.width = "84px";
							elem.style.height = "84px";
							if(this.settings.glow){
								elem.style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
							};
						}
						else if(this.settings.borders === 3){
							elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811413351937998848/giphy_7.gif';
							elem.style.top = "-12px";
							elem.style.left = "-12px";
							elem.style.width = "104px";
							elem.style.height = "104px";
						}
						else if(this.settings.borders === 4){
							elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811414329378471976/original.gif';
							elem.style.position = "absolute";
							elem.style.top = "-6px";
							elem.style.left = "-6px";
							elem.style.width = "92px";
							elem.style.height = "92px";
							if(this.settings.glow){
								st.style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
							};	
						}
						else if(this.settings.borders === 5){
							elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811412156272214016/d26ab6e45a7d77b5f41704c31403d40c.gif';
							elem.style.position = "absolute";
							elem.style.top = "-6px";
							elem.style.left = "-6px";
							elem.style.width = "92px";
							elem.style.height = "92px";
							if(this.settings.glow){
								st.style.boxShadow = `0 0 5px ${hex}, 0 0 15px ${hex}`;
							};	
						}
						else if(this.settings.borders === 6){
							elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811412588754763806/giphy_1.gif';
							elem.style.top = "-16px";
							elem.style.left = "-12px";
							elem.style.width = "104px";
							elem.style.height = "104px";
						}
						else if(this.settings.borders === 7){
							elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811413217963147274/giphy_3.gif';
							elem.style.top = "-8px";
							elem.style.left = "-8px";
							elem.style.width = "96px";
							elem.style.height = "96px";
						}
						else if(this.settings.borders === 8){
							elem.src = 'https://cdn.discordapp.com/attachments/572447902249648129/811413250927362098/giphy_4.gif';
							elem.style.top = "-6px";
							elem.style.left = "-8px";
							elem.style.width = "96px";
							elem.style.height = "96px";
						}
						elem.style.backgroundColor = "transparent";
						elem.style.zIndex = "0";
						elem.setAttribute("class", "avatarUploaderInner-3UNxY3 da-avatarUploaderInner avatarUploaderInner-2EvNMg da-avatarUploaderInner");
						if(!bord){
							st.appendChild(elem);
						}
						st.setAttribute("border", "true");
					}
					
				};
				
				getSettingsPanel(){
					return this.buildSettingsPanel().getElement();
				}
			};
		};
		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();