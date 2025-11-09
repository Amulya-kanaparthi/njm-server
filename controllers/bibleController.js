import Bible from '../models/bibleModel.js';


// get all books of bible
// Canonical order of 66 books (KJV / standard Protestant order)
const BIBLE_BOOK_ORDER = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra",
  "Nehemiah", "Esther", "Job", "Psalm", "Proverbs",
  "Ecclesiastes", "Song Of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos",
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy",
  "2 Timothy", "Titus", "Philemon", "Hebrews", "James",
  "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation"
];

const TELUGU_BOOK_ORDER = [
  // పాత నిబంధన (Old Testament)
  "ఆదికాండము",
  "నిర్గమకాండము",
  "లేవీయకాండము",
  "సంఖ్యాకాండము",
  "ద్వితీయోపదేశకాండమ",
  "యెహొషువ",
  "న్యాయాధిపతులు",
  "రూతు",
  "సమూయేలు మొదటి గ్రంథము",
  "సమూయేలు రెండవ గ్రంథము",
  "రాజులు మొదటి గ్రంథము",
  "రాజులు రెండవ గ్రంథము",
  "దినవృత్తాంతములు మొదటి గ్రంథము",
  "దినవృత్తాంతములు రెండవ గ్రంథము",
  "ఎజ్రా",
  "నెహెమ్యా",
  "ఎస్తేరు",
  "యోబు గ్రంథము",
  "కీర్తనల గ్రంథము",
  "సామెతలు",
  "ప్రసంగి",
  "పరమగీతము ",
  "యెషయా గ్రంథము ",
  "యిర్మీయా",
  "విలాపవాక్యములు",
  "యెహెజ్కేలు",
  "దానియేలు",
  "హొషేయ",
  "యోవేలు",
  "ఆమోసు",
  "ఓబద్యా",
  "యోనా",
  "మీకా ",
  "నహూము",
  "హబక్కూకు",
  "జెఫన్యా",
  "హగ్గయి",
  "జెకర్యా",
  "మలాకీ",

  // క్రొత్త నిబంధన (New Testament)
  "మత్తయి సువార్త",
  "మార్కు సువార్త",
  "లూకా సువార్త",
  "యోహాను సువార్త",
  "అపొస్తలుల కార్యములు",
  "రోమీయులకు",
  "1 కొరింథీయులకు",
  "2 కొరింథీయులకు",
  "గలతీయులకు",
  "ఎఫెసీయులకు",
  "ఫిలిప్పీయులకు",
  "కొలొస్సయులకు",
  "1 థెస్సలొనీకయులకు",
  "2 థెస్సలొనీకయులకు",
  "1 తిమోతికి",
  "2 తిమోతికి",
  "తీతుకు",
  "ఫిలేమోనుకు",
  "హెబ్రీయులకు",
  "యాకోబు",
  "1 పేతురు",
  "2 పేతురు",
  "1 యోహాను",
  "2 యోహాను",
  "3 యోహాను",
  "యూదా",
  "ప్రకటన గ్రంథము"
];


export const getBooks = async (req, res) => {
  try {
    const { language } = req.params;
    const books = await Bible.distinct("book", { language });

    //sort according to the canonical order

    const orderList = language === "telugu" ? TELUGU_BOOK_ORDER : BIBLE_BOOK_ORDER;


    const orderedBooks = orderList.filter( book =>
        books.includes(book)
    );

    res.status(200).json({
      status: 1,
      message: "Books fetched successfully",
      data: orderedBooks,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Error fetching books",
      error: error.message,
    });
  }
};


// get chapters for a book
export const getChapters = async (req, res) => {
  try {
    const { language, book } = req.params;
    const chapters = await Bible.find({ language, book }).select("chapter -_id");

    res.status(200).json({
      status: 1,
      message: "Chapters fetched successfully",
      data: chapters.map(c => c.chapter),
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Error fetching chapters",
      error: error.message,
    });
  }
};

// get verses for a chapter
export const getVerses = async (req, res) => {
  try {
    const { language, book, chapter } = req.params;
    const chapterData = await Bible.findOne({ language, book, chapter: Number(chapter) });

    if (!chapterData) {
      return res.status(404).json({
        status: 0,
        message: "Chapter not found",
      });
    }

    res.status(200).json({
      status: 1,
      message: "Verses fetched successfully",
      data: chapterData.verses,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Error fetching verses",
      error: error.message,
    });
  }
};


// get full bible

export const getFullBible = async (req,res) => {
  try {
      const {language} = req.params;

      if (!language){
        return res.status(400).json({
          status : 0,
          message : "Language is required",
        });
      }

      const bibleChapters = await Bible.find({language});

      const bibleData = {};

      bibleChapters.forEach((entry) => {
        if(!bibleData[entry.book]){
          bibleData[entry.book] = {};
        }
        bibleData[entry.book][entry.chapter] = entry.verses;
      })

      res.status(200).json({
      status: 1,
      message: "Bible fetched successfully",
      data: bibleData,
    });

  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Error fetching full Bible",
      error: error.message,
    });
  }
};