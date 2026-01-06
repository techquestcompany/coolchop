import {View,Text,Button,StyleSheet,TouchableOpacity,SafeAreaView} from 'react-native'
import { FontAwesome } from '@expo/vector-icons';
import { router  } from 'expo-router';

const AboutCoolchop = () => {
    return (
     <SafeAreaView style={styles.contentContainer}>
     <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
     <FontAwesome name="arrow-left" size={24} color="#D32F2F" />
   </TouchableOpacity>
      <Text style={styles.title} >Who are we?</Text>
      <View style={styles.textContainer} >
        <Text style={styles.contentText} >
          Coolchop is a food delivery company in Ghana registered under registrar of companies. We bridge the gap between food vendors and consumers by putting the neccesary procedures and tools in place so
          customers can order food from their place of comfort and get it delivered to them. We use our riders who serve as the linkup between the customer and the vendor.
          Our riders are professionally trained and have our customers at heart.

        </Text>
        

        <Text style={styles.title} >How does it work?</Text>
        <Text style={styles.contentText} >
         1. A customer browse through the list of foods and choose what to order. 
        </Text>
        <Text style={styles.contentText} >
         2. He makes the order and proceed to pay. 
        </Text>

        <Text style={styles.contentText} >
         3. The rider brings his food.
        </Text>
        
        
      </View>
     </SafeAreaView>
    );
  };
  const styles= StyleSheet.create({
    contentContainer:{ 
      flex:1,
      marginTop:15
    },
    title:{
      fontWeight:"bold",
      fontSize:25
    },
    textContainer:{
     margin:4,

    },
    backButton: {
      alignSelf: 'flex-start',
      marginBottom: 20,
    },
    contentText:{
      fontSize:18
    }

  })
export default AboutCoolchop  


/*function placeFigures(n, m, figures) {                  // Define a function that takes grid size (n rows, m cols) and a list of figure letters.
  const grid = Array.from({ length: n }, () => Array(m).fill(0)); // Create an n × m matrix filled with 0, representing empty cells.

  const SHAPES = {                                       // Define the five shapes using 2D matrices of 1s (occupied) and 0s (empty).
    A: [                                                 // Figure A: an L-shape.
      [1, 1],                                            // Top row: two blocks.
      [1, 0],                                            // Bottom row: left block only.
    ],
    B: [                                                 // Figure B: a T-shape.
      [1, 1, 1],                                         // Top row: three blocks.
      [0, 1, 0],                                         // Bottom row: middle block only.
    ],
    C: [                                                 // Figure C: a 2×2 square.
      [1, 1],
      [1, 1],
    ],
    D: [                                                 // Figure D: a vertical 3×1 line.
      [1],
      [1],
      [1],
    ],
    E: [                                                 // Figure E: a J-shape.
      [1, 0, 0],                                         // Top row: left block.
      [1, 1, 1],                                         // Bottom row: three blocks.
    ],
  };

  for (let idx = 0; idx < figures.length; idx++) {       // Iterate over each requested figure by index (0-based).
    const figType = figures[idx];                        // Get the letter for the current figure (e.g., 'A').
    const shape = SHAPES[figType];                       // Look up the shape matrix for that figure type.
    const stamp = idx + 1;                               // Compute the 1-based label to write into the grid for this figure.
    let placed = false;                                  // Track if we manage to place this figure on the grid.

    for (let r = 0; r < n && !placed; r++) {             // Scan rows from top to bottom until placed.
      for (let c = 0; c < m && !placed; c++) {           // Scan columns left to right until placed.
        const shapeRows = shape.length;                  // Height of the shape matrix.
        const shapeCols = shape[0].length;               // Width of the shape matrix.
        if (r + shapeRows > n || c + shapeCols > m) continue; // Skip if the shape would go out of bounds at (r, c).

        let canPlace = true;                             // Assume we can place unless we find a collision.
        for (let sr = 0; sr < shapeRows && canPlace; sr++) {  // Iterate over shape rows.
          for (let sc = 0; sc < shapeCols && canPlace; sc++) { // Iterate over shape cols.
            if (shape[sr][sc] === 1 && grid[r + sr][c + sc] !== 0) { // If shape wants to occupy a non-empty grid cell...
              canPlace = false;                          // ...then placement at this anchor is invalid.
            }
          }
        }

        if (canPlace) {                                  // If all occupied shape cells map to empty grid cells...
          for (let sr = 0; sr < shapeRows; sr++) {       // ...stamp the figure onto the grid.
            for (let sc = 0; sc < shapeCols; sc++) {
              if (shape[sr][sc] === 1) {                // Only write where the shape has a 1.
                grid[r + sr][c + sc] = stamp;           // Write the figure's index into the grid at the offset.
              }
            }
          }
          placed = true;                                 // Mark as placed to stop searching for anchors for this figure.
        }
      }
    }
    // If not placed, we skip silently. Depending on requirements, you could throw or log here.
  }

  return grid;                                           // Return the final grid with all placed figures.
}*/
