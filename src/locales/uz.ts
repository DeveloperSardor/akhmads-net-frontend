export const uz = {
	// Navbar
	navbar: {
		input: "Universitetlar yoki ta'lim sohalarini qidiring",
		contact: "Aloqa",
		contactUs: "Biz bilan bog'lanish",
		links: {
			aboutUs: "Biz haqimizda",
			universities: "Universitetlar",
			studentServices: "Talabalar uchun xizmatlar",
			media: "Media",
			apply: "Qanday ariza topshiriladi?",
		},
		notFound: "Ma'lumot topilmadi",
	},

	// Toast
	toast: {
		error: "Habar yuborishda xatolik ketdi, iltimos qayta urinib ko'ring!",
	},

	// General
	general: {
		loading: "Yuklanmoqda...",
	},

  // Not found
  notFound: {
    university: "Universitet topilmadi",
    page: "Sahifa topilmadi",
  },

  /* -------------------------------- Home Page ------------------------------- */
  // Home Ancestors
  homeAncestors: {
    title1: "Bizning",
    title2: "Ajdodlarimiz",
  },

	// Home About
	homeAbout: {
		title: "World Study Academy haqida",
	},

	// Home Universities
	homeUniversities: {
		title1: "Top",
		title2: "Universitetlar",
	},

	// Home Student life
	homeStudetLife: {
		title: "O'zbekistonda talaba hayoti",
	},

	// Home Student Stories
	homeStudentStories: {
		title: "Ijtimoiy tarmoqlardagi talaba hikoyalari",
	},

	// Home Contacts
	homeContacts: {
		placeholder: {
			name: "Ism",
			number: "Telefon raqami",
			email: "Elektron pochta",
			country: "Hudud",
		},
		submit: "Jo'natish",
		submitSuccess:
			"Ma'lumotlaringiz qabul qilindi. Tez orada siz bilan bog‘lanamiz",
	},

	// Regions
	regions: {
		qoraqalpogiston: "Qoraqalpogʻiston",
		andijon: "Andijon",
		buxoro: "Buxoro",
		fargona: "Fargʻona",
		jizzax: "Jizzax",
		namangan: "Namangan",
		navoiy: "Navoiy",
		qashqadaryo: "Qashqadaryo",
		samarqand: "Samarqand",
		surxondaryo: "Surxondaryo",
		sirdaryo: "Sirdaryo",
		toshkent: "Toshkent viloyati",
		xorazm: "Xorazm",
		toshkent_shahar: "Toshkent shahri",
	},

	// Validations
	validations: {
		home: {
			nameMin: "Ism kamida 3 ta belgidan iborat boʻlishi kerak",
      nameMax: "Ism ko'pi bilan 20 ta belgidan iborat bo'lishi kerak",
      phoneEmpty: "Telefon raqamini kiriting",
      phoneInvalid: "Iltimos, to'g'ri telefon raqamini kiriting",
      email: "Emailni to'g'ri kiriting",
      country: "Hudud tanlamadingiz",
		},
		apply: {
			step1: {
				nameMin: "Ism kamida 3 ta belgidan iborat boʻlishi kerak",
				nameMax: "Ism ko'pi bilan 20 ta belgidan iborat bo'lishi kerak",
				phone: "Raqam kamida 9 ta belgidan iborat boʻlishi kerak",
				email: "Emailni to'g'ri kiriting",
				birth: "Tu'g'ilgan sanangizni kiriting",
				gender: "Jinsingizni tanlang",
				phoneRegex: "Telefon raqam faqat raqamlardan iborat bo‘lishi kerak",
			},
			step2: {
				lastSchool: "Tugatgan ta'lim muassangizni kiriting",
				gradYear: "Tugatgan yilingizni to'g'ri kriting",
				gradOverYear: "Bitirgan yil hozirgi yildan katta bo'lishi mumkin emas",
				gpaRegex: "Max 5",
				gpaInvalid: "GPA'ni to'g'ri kiriting",
				certificateInvalid: "Sertifikat/yutuqlaringizni kiriting",
			},
			step3: {
				emptyField: "Iltimos, qiymat tanlang",
			},
			step4: {
				emptyFile: "Fayl bo'sh bo'lishi mumkin emas",
			},
			fileSize: "Fayl hajmi 3MB dan oshmasligi kerak",
		},
	},

	// Footer
	footer: {
		privacy: "Maxfiylik siyosati",
		rights: "Barcha huquqlar himoyalangan",
	},

	// Apply
	apply: {
		stepBar: {
			personal: "Shaxsiy ma'lumotlar",
			academic: "Akademik ma'lumotlar",
			program: "Dastur tanlovi",
			documents: "Qo'shimcha hujjatlar",
		},
		step1: {
			fullName: "To'liq ismi *",
			email: "Elektron pochta manzili *",
			phone: "Telefon raqami *",
			birth: "Tug'ilgan sana *",
			gender: "Jinsi *",
			placeholders: {
				fullNamePlaceholder: "F.I.SH",
				emailPlaceholder: "sizningelektronpochtangiz@gmail.com",
				genderPlaceholder: "Jinsingizni kiriting",
			},
			selectValues: {
				gender: {
					male: "Erkak",
					female: "Ayol",
				},
			},
		},
		step2: {
			lastSchool: "Oxirgi o‘qigan maktab/kollej *",
			graduationYear: "Bitirgan yil *",
			gpa: "GPA / O‘rtacha ball *",
			transcriptFileUpload: "Baholar jadvalini yuklash",
			certificates: "Erishgan yutuqlar yoki sertifikatlar *",
			placeholdersStep2: {
				lastSchoolPlaceholder: "Oxirgi o‘qigan maktab/kollej",
				graduationYearPlaceholder: "Bitirgan yil",
				gpaPlaceholder: "GPA / O‘rtacha ball",
			},
		},
		step3: {
			university: "Universitet *",
			degreeType: "Daraja turi *",
			facultyDepartment: "Fakultet/Bo'lim *",
			preferredMajor: "Afzal ko'rilgan mutaxassislik *",
			modeOfStudy: "O'qish shakli *",
			intakePeriod: "Qabul davri *",
			placeholdersStep3: {
				universityPlaceholder: "Universitet",
				degreeTypePlaceholder: "Daraja turi",
				facultyDepartmentPlaceholder: "Fakultet/Bo'lim",
				preferredMajorPlaceholder: "Afzal ko'rilgan mutaxassislik",
				modeOfStudyPlaceholder: "O'qish shakli",
				intakePeriodPlaceholder: "Qabul davri",
			},
			notFound: "Ma'lumot topilmadi",
			bachelor: "Bakalavr",
			masters: "Magistratura",
		},
		step4: {
			passportScan: "Passport skaneri *",
			diplomaAttestat: "Diplom/Attestat",
			transcript: "Transkript",
			motivationLetter: "Motivatsiya xati *",
			recommendationLetters: "Tavsiyanoma xatlari *",
			cvResume: "Rezyume *",
			photo: "Rasm *",
		},
		defaultFileChoosenPlaceholder:
			"Faylni tanlang (.pdf, .doc, .docx, .jpeg, .jpg, .png)",
		nextButton: "Keyingisi",
		prevButton: "Oldingisi",
		submitButton: "Yuborish",
		successSubmit: "Ariza muvaffaqiyatli yuborildi!",
		errorSubmit: "Yuborishda xatolik yuz berdi!",
		stepChangeError: "Iltimos, oldingi bosqichlarni to‘ldiring!",
	},

	// Buttons
	buttons: {
		applyNow: "Hoziroq ariza topshiring",
		aboutUz: "O'zbekiston haqida",
		watchOurTeam: "Jamoamizni tomosha qiling",
		seeMore: "Batafsil ko'rish",
		whyStudy: "Nega O'zbekistonda o'qish kerak?",
		learnMore: "Batafsil ma'lumot",
		moreCostStudy: "O'zbekistonda o'qish narxlari haqida",
		getToKnow: "Bilib oling",
		contactUs: "Biz bilan bog'laning",
		next: "Keyingi",
		back: "Orqaga",
		readMore: "Ko'proq o'qing",
		viewGallery: "Galereyani ko'rish",
	},

	// facultets
	facultets: {
		facultetsHeader: "Ta'lim dasturi haqida ma'lumot",
		facultetsDescr:
			"Ta'lim dasturi haqida ma'lumot mavjud o'quv dasturlari haqida umumiy ma'lumot beradi, kurs tafsilotlari, natijalar va martaba yo'llarini tavsiflaydi.",
		facultetsField: "O'quv sohasi",
		facultetsMode: "O`quv rejimi",
		facultetsDuration: "Davomiyligi",
		facultetsFee: "Yillik o'quv to'lovi",
		facultiesAt: "fakultetlari",
		partnerUnivers:
			"Bizning hamkor universtitetlarimizO‘zbekistondagi hamkor universitetlarimiz",
		rank: "Universitetlar reytingi",
		students: "Xalqaro studentlar soni",
		rate: "Qabul qilish darajasi",
		master: "Magistratura",
		bachelor: "Bakalavr",
		fieldOfStudy: "Taʼlim yoʻnalishi:",
		studyPeriod: "Oʻqish muddati:",
		duration: "Davomiyligi:",
		annualTuitionFee: "Yillik kontrakt toʻlovi:"
	},
	/* -------------------------------- About Page ------------------------------- */
	// About About
	aboutAbout: {
		title1: "Kompaniyamiz ",
		title2: "haqida",
	},
	why_us: {
		title: "Nega aynan biz?",
	},
	team: {
		title: "Jamoamiz bilan tanishing",
	},
	founder: {
		title: "Tasischi",
	},

	// student service
	student_service: {
		food: "Oziq-ovqat va ovqatlanish xarajatlari",
		transportTitle: "Toshkentda jamoat transporti narxi",
	},

	//about-uz photo section
	aboutUzPhotoSection: {
		description: "Eksklyuziv fotosuratlar O'zbekiston bo'ylab",
	},
	media: {
		title1: "Haqiqiy talabalarning haqiqiy hikoyalari",
		title2: "Muhim bo'lgan talaba lahzalari",
		title3: "Talabalar fikrlari",
	},
};
