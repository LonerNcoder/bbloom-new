
/**
 * Extracts book metadata from an XML string.
 *
 * @param {string} xml - The XML string containing the book metadata.
 * @returns {Object} An object containing the extracted title, author, summary, and subjects.
 */
function extract(xml){
    // Extract book title
    const titleMatch = xml.match(/<dc:title[^>]*>(.*?)<\/dc:title>/);
    const title = titleMatch ? titleMatch[1] : null;
    
    // Extract author
    const authorMatch = xml.match(/<dc:creator[^>]*>(.*?)<\/dc:creator>/);
    const author = authorMatch ? authorMatch[1] : null;
    
    // Extract summary
    const summaryMatch = xml.match(/<dc:description[^>]*>(.*?)<\/dc:description>/);
    const summary = summaryMatch ? summaryMatch[1] : null;
    
    const subjectMatches = xml.match(/<dc:subject[^>]*>(.*?)<\/dc:subject>/g);
    
    // Map over matches to get content
    const subjects = subjectMatches ? subjectMatches.map(match => match.match(/<dc:subject[^>]*>(.*?)<\/dc:subject>/)[1]) : [];
    
    const uniqueTags = Array.from(new Set(
        subjects.flatMap(subject => 
          subject.split('--').map(tag => tag.trim())
        )
      ));
      
    return {
        title,
        author,
        summary,
        uniqueTags,
    }
}

export default {extract};

