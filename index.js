var im = null,fn = null,gs=null, fc = null,cn = null,frmIn = null,frmR = null,frmUp = null, btn_signup = null, btn_signin = null, gs = null, err=null, gs22=null, usernameUIF = null, link = null, ct = null, messageList = null;
const dg = document.querySelectorAll('.dialog'),
help = document.querySelector('.help'),
notification = document.querySelector('.notification'),
about = document.querySelector('.about'),
singinUI = document.querySelector('.signinInterface'),
messageUI = document.querySelector('.messageInterface'),
btnMenu = document.querySelector('.btn_menu'),
accountManage = document.querySelector('.manageChat'),
manageProfile = document.querySelector('.accountManaging'),
channelList = document.querySelector('.channel-list'),
btnUsernameChange = document.querySelector('.btn_userChangeName'),
notif = document.querySelector('.noti'), np = /^[\w-\.]{4,32}$/;
var firebaseConfig = {
    apiKey: "AIzaSyAqOBXVucb27Cb64XyOJQOPaflbj-Dxo7I",
    authDomain: "livechat-20f11.firebaseapp.com",
    projectId: "livechat-20f11",
    messagingSenderId: "360519023193",
    appId: "1:360519023193:web:4e1f6658ff49a1f91c0f48"
  };
firebase.initializeApp(firebaseConfig);
class chat {
	constructor(name, channel) {
		this.db = firebase.firestore().collection('messages');
		this.guest = firebase.firestore().collection('guest');
		this.channel = channel;
		this.name = name;
		this.revoke;
	}
	
	changeChannel(newChannel) {
		this.channel = newChannel;
		localStorage.setItem('channel', newChannel);
		if (this.revoke != null) this.revoke();
		this.getChats();
	}
	addElement(id, name, msg, date) {
		const ele = document.createElement('LI');
		ele.dataset.id = id;
		const timing = dateFns.distanceInWordsToNow(new Date(date).toLocaleString(), {addSuffix: true});
		ele.innerHTML += `<span>${name} <span class="TimeCreated">${timing}</span></span>
											<span>${msg}</span>`;
		return ele;
	}
	addNewChat(name, channel, message, time) {
		if(this.channel == 'guest')	this.guest.add({ name, channel, message, time });
		else if (im.msg.value.trim() !== "") this.db.add({ name, channel, message, time }).catch(err=>noti("You don't have permission to send a message.",3000));
	}
	ks(ll){
		if(user.auth.currentUser == null) noti("You don't have permission.", 3500);
		else{
		fc.parentElement.style.display = "flex";
		fc.addEventListener('submit', e => {
			e.preventDefault();
			 
				firebase.firestore().collection('cfd').doc(user.auth.currentUser.uid).get()
				.then(z =>{if(Number(fc.vc.value) === z.data().i) ll();})
				.catch(err=> noti("You don't have permission.", 3500));
				fc.parentElement.style.display = "none";
			});
		}
	}
	ka(main) { 
		if(main){
			this.db.get().then(b => { 
			b.forEach(f =>f.ref.delete()); 
			});
		} else{
			this.guest.get().then(b => { 
			b.forEach(f=>f.ref.delete()); 
			});
		}
		}
	ko(e, main) {
		
		if(main){
			if(e.target.tagName === "LI")
				this.db.doc(e.target.dataset.id).delete();
		else if (e.target.tagName === "SPAN")
				this.db.doc(e.target.parentElement.dataset.id).delete();
		}else{
			if(e.target.tagName === "LI")
				newChat.guest.doc(e.target.dataset.id).delete();
			else if (e.target.tagName === "SPAN")
				newChat.guest.doc(e.target.parentElement.dataset.id).delete();
		}
	}

	getChats() {
		this.clearChat();
		if(this.channel == "guest"){
			this.revoke = this.guest.orderBy('time', 'asc').onSnapshot(snapshot=>{
				snapshot.docChanges().forEach(item => {
					if (item.type === "removed"){
						notifi("A message has been removed", 1500)
						this.removeItems(item.doc);
						setTimeout(_=>{
							location.reload();
						},2000);
					}
					else if (item.type === "added"){
						notifi("New Message", 1000)
						return this.addNewItems(item.doc);
					}
				});
			});
		}else{
		this.revoke = this.db.where('channel', '==', this.channel).orderBy('time', 'asc').onSnapshot(snapshot => {
			snapshot.docChanges().forEach(item => {
				if (item.type === "removed"){
					notifi("A message has been removed", 1500)
					this.removeItems(item.doc);
					setTimeout(_=>{
							location.reload();
					},2000);
				}
				else if (item.type === "added"){
					notifi("New Message", 1000)
					return this.addNewItems(item.doc);
				}
				else if (item.type === "modified") {
					notifi("Updating...", 2000)	
					setTimeout(_=>{
						location.reload();
					},2000);
				}
			});
		}, err=>noti("You don't have permission to see messages.",3000));
		}
	}
	
	addNewItems(item) {
		return messageList.prepend(this.addElement(item.id, item.data().name, item.data().message, item.data().time))
	}
	removeItems(item) {
		return messageList.removeChild(document.querySelector('[data-id="' + item.id + '"]'));
	}
	clearChat() {
		if(messageList != null)
		Array.from(messageList.children).forEach(item => item.remove());
	}
}
var newChat = null;

class auth{

	constructor(){
		this.auth = firebase.auth();
		newChat = new chat(null, localStorage.getItem('channel'));
		this.newUser = false;
	}
	createUser(email, pass, user){
		this.auth.createUserWithEmailAndPassword(email, pass).then(dt=>{
			dt.user.updateProfile({displayName: user});
			this.emailVerification(dt.user);
			notifi(`Account Created successfully! Welcome, ${user}.`, 5000);
			this.newUser = true;
			this.auth.signOut();
			setTimeout(_=>location.reload(), 1500);
		}).catch(e=>{
			console.log("%c" + e.message, "color:red;font-size:x-large;font-weight:600;");
			if(e.message.includes("password")){
				e.innerText = "Your password doesn't meet the requirement.";
			}
			else if (e.message.includes('email'))
				err.innerText = "Your email doesn't meet the requirement.";
			else
				err.innerText ="Something went wrong, please try again.";
			})
	}
	signoutUser(){
		return this.auth.signOut().then(_=>{
			this.signupScreen();
			notifi(`Goodbye, ${newChat.name}`, 3500);
			});
	}
	signinUser(email, pass){
		return this.auth.signInWithEmailAndPassword(email, pass).then(dt=>{
			notifi(`Welcome Back, ${dt.user.displayName}`, 3500);	
		}).catch(e=>{
			console.log("%c" + e.message, "color:red;font-size:x-large;font-weight:600;");
			if(e.message.includes("password"))
				err.innerText = "Your password is incorrect.";
			else if (e.message.includes('email'))
				err.innerText = "Your email is incorrect.";
			else if (e.message.includes('user record'))
				err.innerText = "Account doesn't exist";
			else
				err.innerText = "Login failed, please try again.";
			});
	}
	userCheck(){
		this.auth.onAuthStateChanged(dt=>{
			if(dt == null || this.newUser) this.signupScreen();
			else{
			this.signinScreen();
			this.channelActive(localStorage.getItem('channel'));
			this.accountManageAdmin();			
			}	
		});
	}
	usernameUpdate(newName){
		 this.auth.currentUser.updateProfile({displayName: newName}).then(dt=>notifi(`Username updated to ${this.auth.currentUser.displayName}.`, 5000));
		 newChat.name = this.auth.currentUser.displayName;
		 setTimeout(_=>{location.reload();},2000);
	}
	emailVerification(e){
		if(this.auth.currentUser.emailVerified)
		return notifi("Your email is already verified.", 5000);
		else 
		return e.sendEmailVerification().then(_=>noti(`Please Verify your email.`, 10000));
	}
	updateEmail(newEmail){
		return this.auth.currentUser.updateEmail(newEmail).then(_=>noti(`Email updated.`, 3500));
	}
	updatePassword(newPass){
		return this.auth.currentUser.updatePassword(newPass).then(_=>noti(`Password updated.`, 3500));
	}
	resetPassword(userEmail){
		return this.auth.sendPasswordResetEmail(userEmail).then(_=>
		{
			noti(`Reset password link sent to your email.`, 3500);
			this.signinForm();
		}).catch(e=>{
			console.log("%c" + e.message, "color:red;font-size:x-large;font-weight:600;");
			if(e.message.includes('email')) err.innerText = "Email doesn't exist.";
		});
	}
	deleteUser(userEmail){
		return this.auth.currentUser.delete().then(_=>noti(`Your account deleted.`, 3500));
	}
	signinScreen(){	
		this.signinHTML();
		this.signinQueries();
		newChat = new chat(this.auth.currentUser.displayName, localStorage.getItem('channel'));
		newChat.name = this.auth.currentUser.displayName;	
		usernameUIF.innerText = newChat.name;
		this.signinEvents();
		newChat.changeChannel(localStorage.getItem('channel'));
		
	}
	signupScreen(){
		this.signupHTML();
		this.signupQueries();
		this.signupEvents();
	}

	formRegistration(value){
		if(value.classList.contains('btn_signin')) this.signinForm();
		else if(value.classList.contains('btn_signup')) this.signupForm();
	}
	resetForm(){
		singinUI.innerHTML =  '<form class="frm reseting" autocomplete="off"><p class="error"></p><span class="signupLabel" >Email Address:</span><input type="text" required autocomplete="email" name="email" class="input inputAccount" maxlength="65" placeholder="Enter your Email" ><input type="submit" value="Reset Passowrd" class="btn btn_account reset"></form>';
		err = document.querySelector('.error');
		frmR = document.querySelector('.reseting');
		frmR.addEventListener('submit', e=>{
			e.preventDefault();
			this.resetPassword(frmR.email.value.trim());
		});
	}
	accountManageUser(){
		accountManage.innerHTML = '<span tabindex="1" class="manage editProfile">Account Setting</span><span tabindex="1" class="manage signout">Sign out</span>';
	}
	accountManageAdmin(){
		firebase.firestore().collection('cfd').doc(this.auth.currentUser.uid).get().then(data=>{
			if(data.exists){
			accountManage.innerHTML += '<span tabindex="1" class="manage vf">Clear User Chat</span><span tabindex="1" class="manage vf22">Clear Guest Chat</span>';
			gs = document.querySelector('.vf');		
			gs22 = document.querySelector('.vf22');		
			gs.addEventListener('click', _ => newChat.ks(_ => newChat.ka(true)));
			gs22.addEventListener('click', _ => newChat.ks(_ => newChat.ka(false)));
			}
		});
	}
	signinHTML(){
		btnMenu.innerHTML = "";
		btnMenu.classList.add('hidden');
		singinUI.innerHTML = "";
		channelList.innerHTML = '<li class="list-item"><a href="#" class="item">welcome</a></li><li class="list-item"><a href="#" class="item">general</a></li><li class="list-item"><a href="#" class="item">promote</a></li><li class="list-item"><a href="#" class="item">guest</a></li>';
		btnUsernameChange.innerHTML = '<i class="accountIcon far fa-user-circle"></i><span class="showUsername"> </span><i class="editPen fas fa-pen"></i>';	
		this.messageUIcodes();
		this.accountManageUser();
	}
	signupHTML(){
		messageUI.innerHTML = "";
		btnUsernameChange.innerHTML = "";
		accountManage.innerHTML = "";
		btnMenu.classList.remove('hidden');
		btnMenu.innerHTML = '<span tabindex="1" class="manage btn_signup">Sign up</span><span tabindex="1" class="manage btn_signin">Sign in</span>';		
		this.guestChannel();
		this.messageUIcodes();
		this.signinForm();
	}
	signinQueries(){
		usernameUIF = document.querySelector('.showUsername');
		link = document.querySelectorAll('.list-item');	
		fn = document.querySelector('.inputNameChange');
		fc = document.querySelector('.inputClearChat');
	}
	signupQueries(){
		btn_signup = document.querySelectorAll('.btn_signup');
		btn_signin = document.querySelectorAll('.btn_signin');
		frmIn = document.querySelector('.frm_signin');
		frmUp = document.querySelector('.frm_signup');
	}
	signupForm(){
			messageUI.innerHTML = "";
			channelList.children[0].classList.remove("active");
			singinUI.innerHTML =  '<form class="frm frm_signup" autocomplete="off"><p class="error"></p><span class="signupLabel">Username:</span><input type="text" autocomplete="username" required name="username" class="input inputAccount" maxlength="65" placeholder="Enter your Username" ><span class="signupLabel">Email Address:</span><input type="email" autocomplete="email" required name="email" class="input inputAccount" maxlength="65" placeholder="Enter your Email" ><span class="signupLabel">Password:</span><input type="password" autocomplete="current-password" required class="input inputAccount" name="password" maxlength="65" minlength="6" placeholder="Enter your password"><input type="submit" value="Sign up" name="signup" class="btn btn_account signup"></form>';
			err = document.querySelector('.error');
			frmUp = document.querySelector('.frm_signup');
			frmUp.addEventListener('submit',e=>{
				e.preventDefault();
				this.createUser(frmUp.email.value.trim(), frmUp.password.value, frmUp.username.value.trim());
			});
			
	}
	signinForm(){	
		messageUI.innerHTML = "";
		channelList.children[0].classList.remove("active");
		singinUI.innerHTML =  '<form class="frm frm_signin" autocomplete="off"><p class="error"></p><span class="signupLabel" >Email Address:</span><input type="email" required autocomplete="email" name="email" class="input inputAccount" maxlength="65" placeholder="Enter your Email" ><span class="signupLabel">Password:</span><input type="password" autocomplete="current-password" required class="input inputAccount" name="password" maxlength="65" placeholder="Enter your password"><div class="container_signin"><input type="submit" style="order:2;" value="Sign in" name="signin" class="btn signin"><button class="btn reset" style="order:1;margin-inline-start: 2rem;">Reset password</button></div></form>';
		err = document.querySelector('.error');
		frmIn = document.querySelector('.frm_signin');
		frmIn.addEventListener('click', e=>{
			e.preventDefault();
			if(e.target.classList.contains('signin')) this.signinUser(frmIn.email.value.trim(), frmIn.password.value);
			else if(e.target.classList.contains('reset')) this.resetForm();
		});
		frmIn.addEventListener('submit', e=>{
			e.preventDefault();
			this.signinUser(frmIn.email.value.trim(), frmIn.password.value);
		});
	}
	signinEvents(){
		btnUsernameChange.addEventListener('click', _ => this.changeNameTemplate());
		accountManage.addEventListener('click',e=>{
			e.preventDefault();
			if(e.target.classList.contains('signout')){
					user.signoutUser();
			}else if(e.target.classList.contains('editProfile')){
				manageProfile.style.display = "flex";
				manageProfile.innerHTML = `<span>${this.auth.currentUser.email}</span><button class="btn changeEmail">Change Email</button><button class="btn resetPassword">Change Password</button><button class="btn deleteAccount">Delete account</button>`;
				manageProfile.classList.add('manageProfile');
			}
		});
		link.forEach(l=>{
			l.addEventListener('click', e =>{
				newChat.changeChannel(e.target.innerText);
				this.channelActive(e.target.innerText);
			});
		});
		manageProfile.addEventListener('click',e=>{
			if(e.target.classList.contains('changeEmail')){
				e.target.parentElement.classList.remove('manageProfile');
				e.target.parentElement.innerHTML = '<form class="inputChangeEmail" autocomplete="off"><input type="email" class="input inputSmall" name="email" maxlength="65" placeholder="Enter your new email" ><input type="submit" value="Change email" class="btn btn_box"></form>';
				const ec = document.querySelector('.inputChangeEmail');
				ec.addEventListener('submit',e=>{
					e.preventDefault();
				this.updateEmail(ec.email.value.trim());
				manageProfile.style.display = "none";
				});
			}else if(e.target.classList.contains('resetPassword')){
				e.target.parentElement.classList.remove('manageProfile');
				e.target.parentElement.innerHTML = '<form class="inputChangePassword"><input type="password" autocomplete="new-password" class="input inputSmall" name="password" maxlength="65" minlength="6" placeholder="Enter your new password" ><input type="submit" value="Change password" class="btn btn_box"></form>';
				const pc = document.querySelector('.inputChangePassword');
				pc.addEventListener('submit',e=>{
					e.preventDefault();
					this.updatePassword(pc.password.value.trim());
					manageProfile.style.display = "none";
				});
			}else if(e.target.classList.contains('deleteAccount')){
				e.target.parentElement.classList.remove('manageProfile');
				e.target.parentElement.innerHTML = '<form class="deleteAccountConfirmation"><button class="btn yesDelete">Yes</button><button class="btn noDelete">No</button></form>';
				const yesDelete = document.querySelector('.yesDelete');
				const noDelete = document.querySelector('.noDelete');
				yesDelete.addEventListener('click',e=>{
					e.preventDefault();
					this.deleteUser(this.auth.currentUser.email);
					manageProfile.style.display = "none";
					notifi("Account deleted successfully.");
					setTimeout(_=>{location.reload();},2000);
				});
				noDelete.addEventListener('click',e=>{
					e.preventDefault();
					manageProfile.style.display = "none";
				});
				
			}
		});
		
	}
	guestChannel(){
		channelList.innerHTML = '<li class="list-item"><a href="#" class="item">guest</a></li>';
		channelList.children[0].children[0].addEventListener('click',e =>{
				e.target.parentElement.classList.add("active");
				singinUI.innerHTML = "";
				this.messageUIcodes();
				newChat.changeChannel(e.target.innerText);
			});
	}
	channelActive(text){
		link.forEach(it=>{
			if(it.innerHTML.includes(text)) it.classList.add("active");
			else it.classList.remove("active");
		});
	}
	messageUIcodes(){
		messageUI.innerHTML = '<ul class="messages"></ul><div class="inputMessageInterface"><form class="inputMessage" autocomplete="off"><input type="text" class="input" name="msg" maxlength="255" placeholder="Enter your message..." ><input type="submit" value="Send" name="send" class="btn btn_box"><span data-length="" name="counter" class="counter"></span></form></div>';
		ct = document.querySelector('.counter');
		im = document.querySelector('.inputMessage');
		messageList = document.querySelector('.messages');
		messageList.addEventListener('dblclick', e=>{
			firebase.firestore().collection('cfd').doc(this.auth.currentUser.uid).get().then(data=>{
					if(newChat.channel === 'guest') newChat.ks(_=>newChat.ko(e, false));
					else newChat.ks(_=>newChat.ko(e,true));	
			}).catch(_=>{});
		});
		im.addEventListener('submit', e => {
			e.preventDefault();
				if(newChat.name == null)
				newChat.addNewChat('guest', newChat.channel, im.msg.value.trim(), Number(new Date().getTime()));
				else
				newChat.addNewChat(this.auth.currentUser.displayName, newChat.channel, im.msg.value.trim(), Number(new Date().getTime()));
				im.reset();
				ct.dataset.length = 0;
				ct.classList.remove('exceeded');		
		});
		im.addEventListener('input',_=> {
				if(im.msg.value.length === 255) ct.classList.add('exceeded');
				else ct.classList.remove('exceeded');
				ct.dataset.length = im.msg.value.length
		});
	}
	signupEvents(){
		btnMenu.addEventListener('click',e=>this.formRegistration(e.target));
		
	}
	changeNameTemplate() {
		fn.parentElement.style.display = "flex";
		fn.addEventListener('submit', e => {
			e.preventDefault();
			if (fn.name.value !== "" && fn.name.value.match(np)) {
					this.usernameUpdate(fn.name.value.trim());
					usernameUIF.innerText = newChat.name;
					fn.parentElement.style.display = "none";
					fn.reset();
					noti("Welcome to the chat!", 1500);		
			}
		});
		fn.addEventListener('keyup',e=>{
			if(fn.name.value.match(np)) e.target.style.color = "green"
			else e.target.style.color = "red"
		});
	
}

}
var user = new auth();

window.addEventListener('load', _ => {
	if (localStorage.getItem('channel') === null)
		localStorage.setItem('channel', 'guest')
	user.userCheck();
});




dg.forEach(l => l.addEventListener('click', e => {
	if (e.target.classList.contains('dialog')){
		l.style.display = 'none'
		document.querySelectorAll('input[type=text]').forEach(i=>i.value = "");
	}
}));


function notifi(text, time){
	notification.style.opacity = "1"
	notification.innerText = text;
	setTimeout(_=>notification.style.opacity = "0", time);
}
function noti(text, time){
	notif.style.opacity = "1"
	notif.innerText = text;
	setTimeout(_=>notif.style.opacity = "0", time);
}
help.addEventListener('click', e=>{
	e.preventDefault();
	about.style.display = "flex";
	about.addEventListener('click',e=>{
		if(e.target.tagName === 'SPAN' || e.target.tagName === "H2")
		e.target.parentElement.style.display = "none";
	});
});
