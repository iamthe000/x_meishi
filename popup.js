document.getElementById('generate-btn').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url.includes("x.com") && !tab.url.includes("twitter.com")) {
    alert("Twitter (X) のプロフィール画面を開いてから実行してください。");
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: scrapeTwitterProfile,
  }, (results) => {
    if (results && results[0] && results[0].result) {
      const data = results[0].result;
      
      document.getElementById('username').innerText = data.name || "名称未設定";
      document.getElementById('userid').innerText = data.id || "@---";
      document.getElementById('bio').innerText = data.bio || "（紹介文がありません）";
      document.getElementById('following').innerText = data.following || "0";
      document.getElementById('followers').innerText = data.followers || "0";
      document.getElementById('joined').innerText = data.joined || "";
      
      if (data.icon) {
        document.getElementById('icon').src = data.icon;
      }
    } else {
      alert("情報の取得に失敗しました。プロフィール画面に移動しているか確認してください。");
    }
  });
});

function scrapeTwitterProfile() {
  try {
    // ユーザー名
    const nameEl = document.querySelector('[data-testid="UserName"] span');
    
    // ID (@から始まるテキストを探す)
    const idEls = document.querySelectorAll('[data-testid="UserName"] span');
    let idText = "";
    idEls.forEach(el => { if(el.innerText.startsWith('@')) idText = el.innerText; });

    // Bio文
    const bioEl = document.querySelector('[data-testid="UserDescription"]');
    
    // フォロー・フォロワー数
    const followingEl = document.querySelector('a[href$="/following"] span');
    const followersEl = document.querySelector('a[href$="/verified_followers"] span, a[href$="/followers"] span');

    // 登録日
    const headerItems = document.querySelectorAll('[data-testid="UserProfileHeader_Items"] span');
    let joinedText = "";
    headerItems.forEach(el => { 
      if(el.innerText.includes('登録') || el.innerText.includes('Joined')) {
        joinedText = el.innerText;
      }
    });

    // アイコン画像
    const imgEl = document.querySelector('img[alt*="プロフィール画像"], img[alt*="profile picture"]');

    return {
      name: nameEl ? nameEl.innerText : null,
      id: idText,
      bio: bioEl ? bioEl.innerText : "",
      following: followingEl ? followingEl.innerText : "0",
      followers: followersEl ? followersEl.innerText : "0",
      joined: joinedText,
      icon: imgEl ? imgEl.src : null
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}
