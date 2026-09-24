"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import styles from './selection.module.css';

const ingredients = ["หมู", "ไก่", "เนื้อ", "ไข่ไก่", "กุ้ง", "ปลา", "เป็ด", "ผัก", "ตับหมู", "เห็ด", "เต้าหู้"];
const categories = ["ผัด", "ทอด", "ต้ม", "ย่าง", "แกง"];

export default function SelectionPage() {
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const toggleIngredient = (ing: string) => {
        setSelectedIngredients(prev => 
            prev.includes(ing) ? prev.filter(i => i !== ing) : [...prev, ing]
        );
    };

    const toggleCategory = (cat: string) => {
        setSelectedCategories(prev => 
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    return (
        <div className={styles.pageWrapper}>
            <div className={styles.glowEffect}></div>
            
            <header className={styles.header}>
                <Link href="/" className={styles.backBtn}>
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </Link>
                <div className={styles.logoContainer}>
                    <img src="/image/logo.png" alt="Logo" className={styles.logo} />
                    <h1 className={styles.brandName}>NUEDEE</h1>
                </div>
            </header>

            <main className={styles.mainContent}>
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>วัตถุดิบตามใจฉัน</h2>
                    <div className={styles.grid}>
                        {ingredients.map(ing => (
                            <button 
                                key={ing} 
                                className={`${styles.itemBtn} ${selectedIngredients.includes(ing) ? styles.selected : ''}`}
                                onClick={() => toggleIngredient(ing)}
                            >
                                {ing}
                            </button>
                        ))}
                        <button className={styles.moreBtn}>
                            ดูวัตถุดิบเพิ่มเติม
                            <svg className={styles.dropdownIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>ประเภทอาหาร</h2>
                    <div className={styles.grid}>
                        {categories.map(cat => (
                            <button 
                                key={cat} 
                                className={`${styles.itemBtn} ${selectedCategories.includes(cat) ? styles.selected : ''}`}
                                onClick={() => toggleCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                        <div className={styles.emptyBox}></div>
                    </div>
                </section>
            </main>

            <div className={styles.bottomAction}>
                <button className={styles.goToEatBtn}>
                    GO TO EAT
                </button>
            </div>
        </div>
    );
}
