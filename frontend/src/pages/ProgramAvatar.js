import React, { useState, useEffect } from 'react';
import '../styles/ProgramAvatar.css';

// ─── Image map ────────────────────────────────────────────────────────────────
const SHOP_PREVIEW_IMAGES = {
    p1: '/Avatars/pet-fire-dragon(shop).png',
  p2: '/Avatars/pet-ice-dragon(shop).png',
  p4: '/Avatars/pet-golden-wyvern(shop).png',
  p3: '/Avatars/pet-shadow-drake(shop).png',
  p4: '/Avatars/pet-golden-wyvern(shop).png',
  ar1: '/Avatars/cloth(shop).png',
  ar2: '/Avatars/armour-iron(shop).png',
  ar3: '/Avatars/armour-mage(shop).png',
  ar4: '/Avatars/armour-gold(shop).png',
  ar5: '/Avatars/armour-shadow(shop).png',
  ar6: '/Avatars/armour-dragon(shop).png',
  ae2: '/Avatars/cat(shop).png',
  ae3: '/Avatars/bunny(shop).png',
  ae4: '/Avatars/fox(shop).png',
  hs1: '/Avatars/default(shop).png',
  hs2: '/Avatars/spiky(shop).png',
  hs3: '/Avatars/long(shop).png',
  hs4: '/Avatars/curly(shop).png',
  hs5: '/Avatars/hair-twintails-black(shop).png',   // or a dedicated shop preview
  ae8: '/Avatars/ears-demon(shop).png'

};

const AVATAR_IMAGES = {
  base: {
    s1: '/Avatars/sittingavatar.jpg',
    s2: '/Avatars/skin-brown.png',
  },
  skinArmour: {
    s2_ar2: '/Avatars/skin-brown-iron.png',
    s2_ar3: '/Avatars/skin-brown-mage.png',
    s2_ar4: '/Avatars/skin-brown-gold.png',
    s2_ar5: '/Avatars/skin-brown-shadow.png',
    s2_ar6: '/Avatars/skin-brown-dragon.png',
  },
  armour: {
    ar1: null,
    ar2: '/Avatars/armour-iron.png',
    ar3: '/Avatars/armour-mage.png',
    ar4: '/Avatars/armour-gold.png',
    ar5: '/Avatars/armour-shadow.png',
    ar6: '/Avatars/armour-dragon.png',
    ar7: null, ar8: null, ar9: null, ar10: null,
  },
  hair: {
    hs1_brown: null, hs2_brown: '/Avatars/hair-spiky.png',
    hs3_brown: '/Avatars/hair-long.png', hs4_brown: '/Avatars/hair-wavy.png',
    hs1_black: null, hs2_black: '/Avatars/hair-spiky-black.png',
    hs3_black: '/Avatars/hair-long-black.png', hs4_black: '/Avatars/hair-wavy-black.png',
    hs1_blonde: null, hs2_blonde: '/Avatars/hair-spiky-blonde.png',
    hs3_blonde: '/Avatars/hair-long-blonde.png', hs4_blonde: '/Avatars/hair-wavy-blonde.png',
    hs5_brown: '/Avatars/hair-twintails.png',
hs5_black: '/Avatars/hair-twintails-black.png',
hs5_blonde: '/Avatars/hair-twintails-blonde.png',
  },
  pets: {
    p1: '/Avatars/pet-fire-dragon.png',
    p2: '/Avatars/pet-ice-dragon.png',
    p3: '/Avatars/pet-shadow-drake.png',
    p4: '/Avatars/pet-golden-wyvern.png',
    p5: null, p6: null,
  },
  ears: {
    ae1: null, ae2: '/Avatars/ears-cat.png',
    ae3: '/Avatars/ears-bunny.png', ae4: '/Avatars/ears-fox.png',
    ae5: null, ae6: null, ae7: null, ae8: null,
    ae8: '/Avatars/ears-demon.png',
  },
};

// ─── Shop Data ────────────────────────────────────────────────────────────────
const INITIAL_SHOP = {
  skin: [
    { id:'s1', label:'Peach',       color:'#F4C2A1', owned:true,  price:0   },
    { id:'s2', label:'Brown',       color:'#916746', owned:true,  price:0   },
    { id:'s3', label:'Ivory',       color:'#F5DEB3', owned:false, price:80  },
    { id:'s4', label:'Tan',         color:'#a3774b', owned:false, price:100 },
    { id:'s5', label:'Deep',        color:'#4A2C17', owned:false, price:120 },
    { id:'s6', label:'Mystic Blue', color:'#7EC8E3', owned:false, price:200 },
    { id:'s7', label:'Forest',      color:'#6B8F4E', owned:false, price:200 },
    { id:'s8', label:'Rose',        color:'#E8A0BF', owned:false, price:200 },
    { id:'s9', label:'Void',        color:'#9B6B9B', owned:false, price:350 },
  ],
  hairStyle: [
    { id:'hs1', label:'Default',    owned:true,  price:0,   defaultColor:'#8B4513', back:[], front:[] },
    { id:'hs2', label:'Spiky',      owned:true,  price:0,   defaultColor:'#8B4513', back:[], front:[] },
    { id:'hs3', label:'Long',       owned:true,  price:0,   defaultColor:'#2C1810', back:[], front:[] },
    { id:'hs4', label:'Wavy',       owned:true,  price:0,   defaultColor:'#DAA520', back:[], front:[] },
    { id:'hs5', label:'Twin Tails', owned:false, price:150, defaultColor:'#C0392B', back:[], front:[] },
    { id:'hs6', label:'Ahoge',      owned:false, price:120, defaultColor:'#8E44AD', back:[], front:[] },
    { id:'hs7', label:'Wild Mane',  owned:false, price:250, defaultColor:'#1C1C1C', back:[], front:[] },
  ],
  hairColor: [
    { id:'hc1',  label:'Black',  color:'#1C1C1C', owned:true,  price:0   },
    { id:'hc2',  label:'Brown',  color:'#582b0a', owned:true,  price:0   },
    { id:'hc3',  label:'Blonde', color:'#E8C97A', owned:true,  price:0   },
    { id:'hc5',  label:'Red',    color:'#C0392B', owned:false, price:80  },
    { id:'hc6',  label:'Purple', color:'#8E44AD', owned:false, price:120 },
    { id:'hc7',  label:'Blue',   color:'#2980B9', owned:false, price:120 },
    { id:'hc8',  label:'Pink',   color:'#FF69B4', owned:false, price:100 },
    { id:'hc9',  label:'White',  color:'#E0E0E0', owned:false, price:150 },
    { id:'hc10', label:'Green',  color:'#27AE60', owned:false, price:130 },
  ],
  animalEars: [
    { id:'ae1', label:'No Ears',     color:'#cccccc', owned:true,  price:0,   pixels:[] },
    { id:'ae2', label:'Cat Ears',    color:'#8B6914', owned:true,  price:0,   pixels:[[8,-1,'#8B6914'],[8,-2,'#8B6914'],[9,-2,'#c8a96e'],[17,-1,'#8B6914'],[17,-2,'#8B6914'],[16,-2,'#c8a96e']] },
    { id:'ae3', label:'Bunny',       color:'#E0E0E0', owned:true,  price:0,   pixels:[[9,-1,'#E0E0E0'],[9,-2,'#E0E0E0'],[9,-3,'#ddd'],[16,-1,'#E0E0E0'],[16,-2,'#E0E0E0'],[16,-3,'#ddd']] },
    { id:'ae4', label:'Fox Ears',    color:'#E8690A', owned:true,  price:0,   pixels:[[8,-1,'#E8690A'],[8,-2,'#E8690A'],[9,-2,'#f0a87a'],[17,-1,'#E8690A'],[17,-2,'#E8690A'],[16,-2,'#f0a87a']] },
    { id:'ae5', label:'Bear',        color:'#5C3317', owned:false, price:180, pixels:[[8,-1,'#5C3317'],[9,-1,'#5C3317'],[16,-1,'#5C3317'],[17,-1,'#5C3317']] },
    { id:'ae6', label:'Wolf',        color:'#888888', owned:false, price:200, pixels:[[8,-1,'#888'],[8,-2,'#aaa'],[17,-1,'#888'],[17,-2,'#aaa']] },
    { id:'ae7', label:'Dragon Horns',color:'#B22222', owned:false, price:400, pixels:[[9,-1,'#B22222'],[9,-2,'#CC3333'],[10,-3,'#CC3333'],[16,-1,'#B22222'],[16,-2,'#CC3333'],[15,-3,'#CC3333']] },
    { id:'ae8', label:'Demon Horns', color:'#FF4500', owned:false, price:450, pixels:[[8,-2,'#FF4500'],[7,-3,'#FF6620'],[17,-2,'#FF4500'],[18,-3,'#FF6620']] },
  ],
  armour: [
    { id:'ar1', label:'Cloth Shirt',   owned:true,  price:0,
      pixels:[[7,13,'#4A90D9'],[8,13,'#5A9FE8'],[9,13,'#4A90D9'],[10,13,'#5A9FE8'],[11,13,'#4A90D9'],[12,13,'#5A9FE8'],[13,13,'#4A90D9'],[14,13,'#5A9FE8'],[15,13,'#4A90D9'],[16,13,'#5A9FE8'],[17,13,'#4A90D9'],[18,13,'#5A9FE8'],
               [7,14,'#5A9FE8'],[8,14,'#4A90D9'],[9,14,'#5A9FE8'],[10,14,'#4A90D9'],[11,14,'#5A9FE8'],[12,14,'#4A90D9'],[13,14,'#5A9FE8'],[14,14,'#4A90D9'],[15,14,'#5A9FE8'],[16,14,'#4A90D9'],[17,14,'#5A9FE8'],[18,14,'#4A90D9']] },
    { id:'ar2', label:'Iron Armour',     owned:true,  price:0   },
    { id:'ar3', label:'Purple Armour',   owned:true,  price:0   },
    { id:'ar4', label:'Gold Armour',     owned:true,  price:0   },
    { id:'ar5', label:'Shadow Cloak',    owned:true,  price:0   },
    { id:'ar6', label:'Red Armour',      owned:true,  price:0   },
    { id:'ar7', label:'Crystal Armour',  owned:false, price:300,
      pixels:[[7,13,'#A8D8EA'],[8,13,'#87CEEB'],[9,13,'#A8D8EA'],[10,13,'#B0E2FF'],[11,13,'#87CEEB'],[12,13,'#A8D8EA'],[13,13,'#A8D8EA'],[14,13,'#87CEEB'],[15,13,'#B0E2FF'],[16,13,'#A8D8EA'],[17,13,'#87CEEB'],[18,13,'#A8D8EA']] },
    { id:'ar8', label:'Lava Armour',     owned:false, price:350,
      pixels:[[7,13,'#8B0000'],[8,13,'#FF4500'],[9,13,'#8B0000'],[10,13,'#FF6347'],[11,13,'#8B0000'],[12,13,'#FF4500'],[13,13,'#FF4500'],[14,13,'#8B0000'],[15,13,'#FF6347'],[16,13,'#8B0000'],[17,13,'#FF4500'],[18,13,'#8B0000']] },
    { id:'ar9', label:'Celestial Robe',  owned:false, price:500,
      pixels:[[7,13,'#1a1a4e'],[8,13,'#FFD700'],[9,13,'#1a1a4e'],[10,13,'#C0C0C0'],[11,13,'#1a1a4e'],[12,13,'#FFD700'],[13,13,'#FFD700'],[14,13,'#1a1a4e'],[15,13,'#C0C0C0'],[16,13,'#1a1a4e'],[17,13,'#FFD700'],[18,13,'#1a1a4e']] },
    { id:'ar10', label:'Abyssal Armour', owned:false, price:600,
      pixels:[[7,13,'#0d0d0d'],[8,13,'#1a0033'],[9,13,'#0d0d0d'],[10,13,'#4B0082'],[11,13,'#0d0d0d'],[12,13,'#1a0033'],[13,13,'#1a0033'],[14,13,'#0d0d0d'],[15,13,'#4B0082'],[16,13,'#0d0d0d'],[17,13,'#1a0033'],[18,13,'#0d0d0d']] },
  ],
  pets: [
    { id:'p1', label:'Fire Dragon',   color:'#FF6B35', emoji:'🐉', owned:true,  price:0   },
    { id:'p2', label:'Ice Dragon',    color:'#74D7F7', emoji:'🐲', owned:true,  price:0   },
    { id:'p3', label:'Shadow Drake',  color:'#7E57C2', emoji:'🦎', owned:false, price:400 },
    { id:'p4', label:'Golden Wyvern', color:'#FFD700', emoji:'🌟', owned:true,  price:0   },
    { id:'p5', label:'Storm Drake',   color:'#90CAF9', emoji:'⚡', owned:false, price:450 },
    { id:'p6', label:'Void Dragon',   color:'#9C27B0', emoji:'🌑', owned:false, price:600 },
  ],
};

const CATEGORIES = [
  { key:'skin',       label:'SKIN',        icon:'skin'    },
  { key:'hairStyle',  label:'HAIR STYLE',  icon:'hair'    },
  { key:'hairColor',  label:'HAIR COLOR',  icon:'palette' },
  { key:'animalEars', label:'ANIMAL EARS', icon:'ears'    },
  { key:'armour',     label:'ARMOUR',      icon:'shield'  },
  { key:'pets',       label:'PETS',        icon:'paw'     },
];

// ─── Load/save shop state from localStorage ───────────────────────────────────
const SHOP_STORAGE_KEY = 'healup_shop_owned';

const loadShopState = () => {
  try {
    const saved = localStorage.getItem(SHOP_STORAGE_KEY);
    if (!saved) return INITIAL_SHOP;
    const ownedMap = JSON.parse(saved); // { category: [id, id, ...] }
    const merged = {};
    Object.keys(INITIAL_SHOP).forEach(cat => {
      merged[cat] = INITIAL_SHOP[cat].map(item => ({
        ...item,
        owned: item.owned || (ownedMap[cat] || []).includes(item.id),
      }));
    });
    return merged;
  } catch {
    return INITIAL_SHOP;
  }
};

const saveShopState = (shop) => {
  try {
    const ownedMap = {};
    Object.keys(shop).forEach(cat => {
      ownedMap[cat] = shop[cat].filter(i => i.owned).map(i => i.id);
    });
    localStorage.setItem(SHOP_STORAGE_KEY, JSON.stringify(ownedMap));
  } catch {}
};

// ─── Sitting Avatar (layered) ─────────────────────────────────────────────────
const SittingAvatar = ({ selections }) => {
  const skin   = selections.skin      || 's1';
  const armour = selections.armour    || 'ar1';
  const style  = selections.hairStyle || 'hs1';
  const color  = selections.hairColor || 'hc1';

  const colorMap  = { hc1:'black', hc2:'brown', hc3:'blonde' };
  const colorName = colorMap[color] || 'brown';

  const skinArmourImg = AVATAR_IMAGES.skinArmour[`${skin}_${armour}`] || null;
  const baseImg       = AVATAR_IMAGES.base[skin] || '/Avatars/sittingavatar.jpg';
  const armourImg     = skin === 's1' ? (AVATAR_IMAGES.armour[armour] || null) : null;
  const hairImg       = AVATAR_IMAGES.hair[`${style}_${colorName}`] || null;
  const earsImg       = AVATAR_IMAGES.ears[selections.animalEars] || null;

  return (
    <div className="avatar-img-wrapper">
      <img src={skinArmourImg || baseImg} alt="avatar" className="avatar-base-img"
        onError={(e) => { e.target.src = '/Avatars/sittingavatar.jpg'; }} />
      {armourImg && <img src={armourImg} alt="armour" className="avatar-layer-img"
        onError={(e) => { e.target.style.display = 'none'; }} />}
      {hairImg && <img src={hairImg} alt="hair" className="avatar-layer-img"
        onError={(e) => { e.target.style.display = 'none'; }} />}
      {earsImg && <img src={earsImg} alt="ears" className="avatar-layer-img"
        onError={(e) => { e.target.style.display = 'none'; }} />}
    </div>
  );
};

// ─── Pixel Pet ────────────────────────────────────────────────────────────────
const PixelPet = ({ pet }) => {
  if (!pet) return null;
  const petImg = AVATAR_IMAGES.pets[pet.id];
  if (petImg) {
    return (
      <img src={petImg} alt={pet.label}
        style={{ width:200, height:200, objectFit:'contain', imageRendering:'pixelated', display:'block' }}
        onError={(e) => { e.target.style.display='none'; }} />
    );
  }
  const c = pet.color;
  const dk = '#1a1008';
  const S2 = 3;
  const Px2 = ({ x, y, col }) => <rect x={x*S2} y={y*S2} width={S2} height={S2} fill={col} />;
  const lighter = c + 'cc';
  return (
    <svg viewBox={`0 0 ${10*S2} ${12*S2}`} width={10*S2*2.2} height={12*S2*2.2}
      style={{ imageRendering:'pixelated', display:'block' }} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx={5*S2} cy={11.6*S2} rx={3.5*S2} ry={S2*0.5} fill="#00000033" />
      <Px2 x={1} y={0} col={c} /><Px2 x={2} y={0} col={c} />
      <Px2 x={7} y={0} col={c} /><Px2 x={8} y={0} col={c} />
      <Px2 x={1} y={1} col={c} /><Px2 x={8} y={1} col={c} />
      {[2,3,4,5,6,7].map(x=><Px2 key={`ph${x}`} x={x} y={1} col={dk}/>)}
      {[1,8].map(x=>[2,3,4].map(y=><Px2 key={`phs${x}${y}`} x={x} y={y} col={dk}/>))}
      {[2,3,4,5,6,7].map(x=><Px2 key={`ph2${x}`} x={x} y={5} col={dk}/>)}
      {[2,3,4,5,6,7].map(x=>[2,3,4].map(y=><Px2 key={`pf${x}${y}`} x={x} y={y} col={c}/>))}
      <Px2 x={3} y={3} col="#ffffff"/><Px2 x={6} y={3} col="#ffffff"/>
      <rect x={3*S2} y={3*S2} width={2} height={2} fill="#ffffffcc"/>
      <rect x={6*S2} y={3*S2} width={2} height={2} fill="#ffffffcc"/>
      <Px2 x={4} y={4} col={lighter}/><Px2 x={5} y={4} col={lighter}/>
      {[2,3,4,5,6,7].map(x=><Px2 key={`pbo${x}`} x={x} y={6} col={dk}/>)}
      {[1,8].map(x=>[6,7,8,9].map(y=><Px2 key={`pbos${x}${y}`} x={x} y={y} col={dk}/>))}
      {[2,3,4,5,6,7].map(x=><Px2 key={`pbo2${x}`} x={x} y={10} col={dk}/>)}
      {[2,3,4,5,6,7].map(x=>[7,8,9].map(y=><Px2 key={`pbf${x}${y}`} x={x} y={y} col={lighter}/>))}
      <Px2 x={8} y={9} col={c}/><Px2 x={9} y={8} col={c}/><Px2 x={9} y={7} col={c}/>
    </svg>
  );
};

// ─── Preview Icon ─────────────────────────────────────────────────────────────
const PreviewIcon = ({ item, category, hairCol }) => {
  if (category === 'skin' || category === 'hairColor') {
    return (
      <div style={{
        width:36, height:36, borderRadius:'50%', background: item.color,
        boxShadow:'inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.3)',
        border:'2px solid rgba(0,0,0,0.1)'
      }} />
    );
  }
  if (category === 'pets') {
  const shopImg = SHOP_PREVIEW_IMAGES[item.id];  // ADD THIS LINE
  if (shopImg) return <img src={shopImg} alt={item.label} style={{ width:42, height:42, objectFit:'contain', borderRadius:6 }} onError={(e)=>{e.target.style.display='none'}} />;
  const petImg = AVATAR_IMAGES.pets[item.id];
  if (petImg) return <img src={petImg} alt={item.label} style={{ width:42, height:42, objectFit:'contain', borderRadius:6 }} onError={(e)=>{e.target.style.display='none'}} />;
  return <span style={{ fontSize:'1.7rem' }}>{item.emoji}</span>;
}
  if (category === 'hairStyle') {
    const shopImg = SHOP_PREVIEW_IMAGES[item.id];
    if (shopImg) return <img src={shopImg} alt={item.label} style={{ width:42, height:42, objectFit:'contain', imageRendering:'pixelated', borderRadius:6 }} onError={(e)=>{e.target.style.display='none'}} />;
    return <img src="/Avatars/sittingavatar.jpg" alt="default" style={{ width:42, height:42, objectFit:'contain', imageRendering:'pixelated', borderRadius:6 }} />;
  }
  if (category === 'animalEars') {
    const shopImg = SHOP_PREVIEW_IMAGES[item.id];
    if (shopImg) return <img src={shopImg} alt={item.label} style={{ width:42, height:42, objectFit:'contain', imageRendering:'pixelated', borderRadius:6 }} onError={(e)=>{e.target.style.display='none'}} />;
    if (item.id === 'ae1') return <span style={{ fontSize:'1.4rem' }}>⛔</span>;
    return <svg viewBox="3 -3 20 6" width="48" height="20" style={{ imageRendering:'pixelated' }}>{item.pixels?.map((px,i)=><rect key={i} x={px[0]} y={px[1]} width={1} height={1} fill={px[2]==='hc'?hairCol:px[2]} />)}</svg>;
  }
  if (category === 'armour') {
    const imgSrc = SHOP_PREVIEW_IMAGES[item.id];
    if (imgSrc) return <img src={imgSrc} alt={item.label} style={{ width:42, height:42, objectFit:'contain', imageRendering:'pixelated', borderRadius:6 }} onError={(e)=>{e.target.style.display='none'}} />;
    return <svg viewBox="6 12 14 8" width="42" height="24" style={{ imageRendering:'pixelated' }}>{item.pixels?.map((px,i)=><rect key={i} x={px[0]} y={px[1]} width={1} height={1} fill={px[2]} />)}</svg>;
  }
  return <div style={{ width:36, height:36, borderRadius:'50%', background: item.color||'#ccc' }} />;
};

// ─── Category Icons ───────────────────────────────────────────────────────────
const CatIcon = ({ type, size=26 }) => {
  const p = { width:size, height:size, viewBox:'0 0 24 24', fill:'none',
    stroke:'currentColor', strokeWidth:1.8, strokeLinecap:'round', strokeLinejoin:'round' };
  if (type === 'skin') {
    return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0112 0v2"/></svg>;
  }
  const pngMap = {
    hair:    '/Avatars/hairstyle.png',
    palette: '/Avatars/hair-color.png',
    ears:    '/Avatars/petears.png',
    shield:  '/Avatars/armour.png',
    paw:     '/Avatars/pet.png',
  };
  const src = pngMap[type];
  if (src) return <img src={src} alt={type} style={{ width:size, height:size, objectFit:'contain', display:'block' }} onError={(e)=>{e.target.style.display='none'}} />;
  return <svg {...p}><circle cx="12" cy="12" r="10"/></svg>;
};

// ─── Unlock Confirmation Modal ────────────────────────────────────────────────
const UnlockConfirmModal = ({ item, category, coins, onConfirm, onCancel }) => {
  const canAfford = coins >= item.price;

  return (
    <div className="modal-overlay" onClick={onCancel} style={{ zIndex: 1100 }}>
      <div className="unlock-confirm-box" onClick={e => e.stopPropagation()}>
        {/* Animated coin ring */}
        <div className="unlock-coin-ring">
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="32" fill="none" stroke={canAfford ? '#FFD700' : '#ef4444'} strokeWidth="3" strokeDasharray="8 4" opacity="0.4">
              <animateTransform attributeName="transform" type="rotate" from="0 36 36" to="360 36 36" dur="8s" repeatCount="indefinite" />
            </circle>
            <circle cx="36" cy="36" r="26" fill={canAfford ? 'rgba(255,215,0,0.12)' : 'rgba(239,68,68,0.12)'} />
            <text x="36" y="42" textAnchor="middle" fontSize="26" fill={canAfford ? '#FFD700' : '#ef4444'}>🪙</text>
          </svg>
        </div>

        <h3 className="unlock-title">Unlock Item</h3>
        <p className="unlock-item-name">{item.label}</p>

        <div className="unlock-cost-row">
          <span className="unlock-cost-label">Cost</span>
          <span className={`unlock-cost-value ${canAfford ? '' : 'unlock-cant-afford'}`}>
            🪙 {item.price} coins
          </span>
        </div>
        <div className="unlock-cost-row">
          <span className="unlock-cost-label">Your balance</span>
          <span className="unlock-balance-value">🪙 {coins} coins</span>
        </div>

        {!canAfford && (
          <div className="unlock-insufficient">
            <span>⚠️</span>
            <span>Not enough coins! You need {item.price - coins} more.</span>
          </div>
        )}

        {canAfford && (
          <div className="unlock-remaining">
            After purchase: 🪙 {coins - item.price} coins remaining
          </div>
        )}

        <div className="unlock-btn-row">
          <button className="unlock-cancel-btn" onClick={onCancel}>Cancel</button>
          <button
            className={`unlock-confirm-btn ${!canAfford ? 'unlock-confirm-disabled' : ''}`}
            onClick={() => canAfford && onConfirm()}
            disabled={!canAfford}
          >
            {canAfford ? '🔓 Unlock Now' : '🔒 Cannot Afford'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Shop Modal ───────────────────────────────────────────────────────────────
const ShopModal = ({ category, selections, shop, coins, onSelect, onUnlock, onClose }) => {
  const items   = shop[category.key] || [];
  const current = selections[category.key];
  const hairCol = shop.hairColor.find(h => h.id === selections.hairColor)?.color || '#8B4513';
  const [confirmItem, setConfirmItem] = useState(null);
  const [justUnlocked, setJustUnlocked] = useState(null);

  const handleUnlockConfirm = (item) => {
    onUnlock(category.key, item.id, item.price);
    setJustUnlocked(item.id);
    setConfirmItem(null);
    // Auto-equip after short delay for visual feedback
    setTimeout(() => {
      onSelect(item.id);
    }, 400);
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <CatIcon type={category.icon} size={22} />
            <h2 className="modal-title">{category.label}</h2>
            {/* Live coin display in modal */}
            <div className="modal-coins-badge">
              <span>🪙</span>
              <span>{coins}</span>
            </div>
            <button className="modal-close-btn" onClick={onClose}>✕</button>
          </div>
          <p className="modal-subtitle">Tap an owned item to equip · Tap a locked item to purchase</p>

          <div className="modal-grid">
            {items.map(item => {
              const isJustUnlocked = justUnlocked === item.id;
              const canAfford = coins >= item.price;

              return (
                <div key={item.id}
                  className={`modal-item
                    ${!item.owned ? 'locked' : ''}
                    ${current === item.id ? 'selected' : ''}
                    ${isJustUnlocked ? 'just-unlocked' : ''}
                    ${!item.owned && !canAfford ? 'cant-afford' : ''}
                  `}
                  onClick={() => {
                    if (item.owned) onSelect(item.id);
                    else setConfirmItem(item);
                  }}
                  title={!item.owned ? `🪙 ${item.price} coins to unlock` : item.label}
                >
                  <div className="modal-item-visual">
                    <PreviewIcon item={item} category={category.key} hairCol={hairCol} />
                    {!item.owned && (
                      <div className={`lock-overlay ${!canAfford ? 'lock-overlay-red' : ''}`}>
                        <span style={{ fontSize: '0.9rem' }}>🔒</span>
                      </div>
                    )}
                    {current === item.id && item.owned && (
                      <div className="equipped-check">✓</div>
                    )}
                    {isJustUnlocked && (
                      <div className="unlock-flash">✨</div>
                    )}
                  </div>
                  <span className="modal-item-label">{item.label}</span>
                  {item.owned ? (
                    <span className="owned-tag">Owned</span>
                  ) : (
                    <span className={`price-tag ${!canAfford ? 'price-tag-red' : 'price-tag-gold'}`}>
                      🪙 {item.price}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="modal-footer">
            <p className="modal-hint">🪙 Complete challenges to earn coins</p>
            <button className="modal-done-btn" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>

      {confirmItem && (
        <UnlockConfirmModal
          item={confirmItem}
          category={category}
          coins={coins}
          onConfirm={() => handleUnlockConfirm(confirmItem)}
          onCancel={() => setConfirmItem(null)}
        />
      )}
    </>
  );
};

// ─── Category Card ────────────────────────────────────────────────────────────
const CategoryCard = ({ cat, selections, shop, onMore }) => {
  const items    = shop[cat.key] || [];
  const selected = items.find(i => i.id === selections[cat.key]);
  const previews = items.filter(i => i.owned).slice(0, 2);
  const hairCol  = shop.hairColor.find(h => h.id === selections.hairColor)?.color || '#8B4513';
  const lockedCount = items.filter(i => !i.owned).length;

  return (
    <div className="category-card" data-testid={`${cat.key}-card`}>
      <div className="category-card-header">
        <CatIcon type={cat.icon} size={28} />
        <h3 className="category-title">{cat.label}</h3>
      </div>
      <div className="category-previews">
        {previews.map(item => (
          <div key={item.id} className="cat-preview-wrap">
            <PreviewIcon item={item} category={cat.key} hairCol={hairCol} />
          </div>
        ))}
      </div>
      {selected && (
        <p className="category-equipped">Equipped: <strong>{selected.label}</strong></p>
      )}
      <button className="more-button" onClick={() => onMore(cat)}
        data-testid={`${cat.key}-more-btn`}>More</button>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProgramAvatar = ({
  avatarSelections,
  setAvatarSelections,
  avatarName,
  setAvatarName,
  stats,
  setStats,
  patchUserStats,
}) => {
  const [activeModal, setActiveModal] = useState(null);
  const [saved,       setSaved]       = useState(false);
  const [shop,        setShop]        = useState(loadShopState);
  const [unlockToast, setUnlockToast] = useState(null);

  // Sync shop state whenever it changes
  useEffect(() => {
    saveShopState(shop);
  }, [shop]);

  const coins = stats?.coins ?? 0;

  const handleSelect = (key, id) => {
    setAvatarSelections(p => ({ ...p, [key]: id }));
    setActiveModal(null);
  };

  const handleUnlock = (categoryKey, itemId, price) => {
    // Deduct coins
    if (setStats) {
      setStats(prev => {
        const next = { ...prev, coins: Math.max(0, (prev.coins ?? 0) - price) };
        try { localStorage.setItem('healup_stats', JSON.stringify(next)); } catch {}
        return next;
      });
    }

    // Also sync to backend if patchUserStats is available
    if (patchUserStats) {
      patchUserStats({ coinDelta: -price });
    }

    // Mark item as owned in shop
    setShop(prev => {
      const updated = {
        ...prev,
        [categoryKey]: prev[categoryKey].map(item =>
          item.id === itemId ? { ...item, owned: true } : item
        ),
      };
      return updated;
    });

    // Show toast
    const item = shop[categoryKey]?.find(i => i.id === itemId);
    if (item) {
      setUnlockToast({ label: item.label, price });
      setTimeout(() => setUnlockToast(null), 3000);
    }
  };

  const equippedItems = CATEGORIES.map(cat => {
    const item = (shop[cat.key] || []).find(i => i.id === avatarSelections[cat.key]);
    return item ? { ...cat, itemLabel: item.label } : null;
  }).filter(Boolean);

  return (
    <div className="page-container">
      {/* Unlock toast */}
      {unlockToast && (
        <div className="unlock-toast">
          <span>✨</span>
          <span><strong>{unlockToast.label}</strong> unlocked for 🪙 {unlockToast.price}!</span>
        </div>
      )}

      <div className="avatar-page-layout">
        {/* TOP: Avatar scene + Info panel */}
        <div className="avatar-top-section">
          <div className="avatar-preview-card" data-testid="avatar-main">
            <div className="avatar-scene">
              <SittingAvatar selections={avatarSelections} />
              {avatarSelections.pets && (
                <div className="pet-beside">
                  <PixelPet pet={shop.pets.find(i => i.id === avatarSelections.pets)} />
                </div>
              )}
            </div>
          </div>

          <div className="avatar-info-panel">
            <p className="section-title">YOUR AVATAR</p>

            {/* Coin balance display */}
            <div className="avatar-coins-display">
              <div className="avatar-coins-icon">🪙</div>
              <div>
                <div className="avatar-coins-amount">{coins.toLocaleString()}</div>
                <div className="avatar-coins-label">coins available</div>
              </div>
            </div>

            <input
              type="text"
              placeholder="Enter your avatar name..."
              value={avatarName}
              onChange={e => { setAvatarName(e.target.value); setSaved(false); }}
              className="avatar-name-input"
              data-testid="avatar-name-input"
            />
            <div className="equipped-summary">
              <p className="equipped-summary-title">Currently Equipped</p>
              <div className="equipped-chips">
                {equippedItems.map(e => (
                  <div key={e.key} className="equipped-chip"
                    onClick={() => setActiveModal(CATEGORIES.find(c => c.key === e.key))}
                    style={{ cursor:'pointer' }}>
                    <CatIcon type={e.icon} size={13} />
                    <strong>{e.itemLabel}</strong>
                  </div>
                ))}
              </div>
            </div>
            <button className="create-button" onClick={() => setSaved(true)} data-testid="avatar-create-btn">
              CREATE AVATAR
            </button>
            {saved && avatarName && (
              <div className="avatar-saved-badge">✅ {avatarName} saved!</div>
            )}
          </div>
        </div>

        {/* BOTTOM: 6 Category Cards */}
        <div className="categories-panel">
          {CATEGORIES.map(cat => (
            <CategoryCard key={cat.key} cat={cat}
              selections={avatarSelections}
              shop={shop}
              onMore={setActiveModal} />
          ))}
        </div>
      </div>

      {activeModal && (
        <ShopModal
          category={activeModal}
          selections={avatarSelections}
          shop={shop}
          coins={coins}
          onSelect={id => handleSelect(activeModal.key, id)}
          onUnlock={handleUnlock}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};

export default ProgramAvatar;
